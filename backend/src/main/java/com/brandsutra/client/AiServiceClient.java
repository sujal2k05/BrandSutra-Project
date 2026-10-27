package com.brandsutra.client;

import com.brandsutra.dto.analysis.AnalysisRequestPayload;


import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class AiServiceClient {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;
    private final String internalApiKey;

    public AiServiceClient(
            RestTemplate restTemplate,
            @Value("${brandsutra.ai-service.url:http://localhost:8000}") String aiServiceUrl,
            @Value("${brandsutra.ai-service.api-key:}") String internalApiKey) {
        this.restTemplate = restTemplate;
        this.aiServiceUrl = aiServiceUrl;
        this.internalApiKey = internalApiKey;
    }

    public AiServiceAnalysisResponse analyzeContent(AnalysisRequestPayload payload) {
        String url = aiServiceUrl + "/api/analyze";
        log.info("Dispatching analysis request to FastAPI AI service at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-API-Key", internalApiKey);

            HttpEntity<AnalysisRequestPayload> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<AiServiceAnalysisResponse> response = restTemplate.postForEntity(url, requestEntity, AiServiceAnalysisResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Received {} findings from AI service. Risk score: {}",
                        response.getBody().getFindings().size(), response.getBody().getRiskScore());
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to communicate with AI Microservice at {}: {}. Generating rule-based findings directly.", url, e.getMessage());
        }

        // Graceful fallback if AI service is temporarily offline: perform emergency rule scan
        return buildFallbackRuleResponse(payload);
    }

    public String extractPdfText(MultipartFile file) {
        String url = aiServiceUrl + "/api/extract-pdf";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<PdfExtractResponse> response = restTemplate.postForEntity(url, requestEntity, PdfExtractResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().getExtractedText();
            }
        } catch (Exception e) {
            log.error("Failed to extract text from PDF via AI service: {}", e.getMessage());
        }
        return "Failed to extract PDF text. AI Service unavailable or corrupted file.";
    }

    public Object analyzeVisualAsset(MultipartFile file, String marketingChannel, String primaryColorHex, String secondaryColorHex) {
        String url = aiServiceUrl + "/api/analyze-visual";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "asset.png";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);
            body.add("marketing_channel", marketingChannel != null ? marketingChannel : "INSTAGRAM");
            body.add("primary_color_hex", primaryColorHex != null ? primaryColorHex : "#6366F1");
            body.add("secondary_color_hex", secondaryColorHex != null ? secondaryColorHex : "#8B5CF6");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Object> response = restTemplate.postForEntity(url, requestEntity, Object.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to analyze visual asset via AI service: {}", e.getMessage());
        }
        return null;
    }

    private AiServiceAnalysisResponse buildFallbackRuleResponse(AnalysisRequestPayload payload) {
        AiServiceAnalysisResponse fallback = new AiServiceAnalysisResponse();
        fallback.setStatus("COMPLETED_WITH_RULES");
        fallback.setFindings(new ArrayList<>());
        
        String text = payload.getSubmittedText() != null ? payload.getSubmittedText().toLowerCase() : "";

        // Check banned terms locally
        if (payload.getBrandRules() != null) {
            for (AnalysisRequestPayload.RulePayload rule : payload.getBrandRules()) {
                if ("BANNED_TERM".equalsIgnoreCase(rule.getRuleType()) && rule.getTermOrPhrase() != null) {
                    if (text.contains(rule.getTermOrPhrase().toLowerCase())) {
                        FindingItem item = new FindingItem();
                        item.setCategory("TERMINOLOGY");
                        item.setIssue("Banned terminology detected: '" + rule.getTermOrPhrase() + "'");
                        item.setSeverity(rule.getSeverity() != null ? rule.getSeverity() : "HIGH");
                        item.setEvidenceStatus("CONTRADICTED");
                        item.setExplanation(rule.getExplanation() != null ? rule.getExplanation() : "Prohibited by brand policy.");
                        item.setSuggestedCorrection(rule.getPreferredReplacement() != null ? "Replace with: " + rule.getPreferredReplacement() : "Remove term");
                        item.setConfidence(1.0);
                        fallback.getFindings().add(item);
                    }
                }
            }
        }

        int score = 0;
        for (FindingItem f : fallback.getFindings()) {
            if ("CRITICAL".equalsIgnoreCase(f.getSeverity())) score += 40;
            else if ("HIGH".equalsIgnoreCase(f.getSeverity())) score += 25;
            else if ("MEDIUM".equalsIgnoreCase(f.getSeverity())) score += 15;
            else score += 5;
        }
        fallback.setRiskScore(Math.min(100, score));
        fallback.setRiskLevel(score <= 20 ? "LOW" : score <= 40 ? "MEDIUM" : score <= 70 ? "HIGH" : "CRITICAL");
        fallback.setSummary("Analyzed using deterministic safety rules.");
        fallback.setExecutionTimeMs(15L);
        return fallback;
    }

    @Data
    public static class AiServiceAnalysisResponse {
        private String status;
        private List<FindingItem> findings = new ArrayList<>();
        private Integer riskScore = 0;
        private String riskLevel = "LOW";
        private String summary;
        private Integer ruleBasedCount = 0;
        private Integer aiBasedCount = 0;
        private Long executionTimeMs = 0L;
    }

    @Data
    public static class FindingItem {
        private String category;
        private String issue;
        private String severity;
        private String evidenceStatus;
        private String explanation;
        private String excerpt;
        private Long evidenceId;
        private String evidenceText;
        private String sourceName;
        private String sourceVersion;
        private String suggestedCorrection;
        private Double confidence = 0.95;
    }

    @Data
    public static class PdfExtractResponse {
        private String filename;
        private Integer pageCount;
        private String extractedText;
        private Integer charCount;
    }
}
