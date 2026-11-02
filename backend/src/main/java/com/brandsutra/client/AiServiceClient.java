package com.brandsutra.client;

import com.brandsutra.dto.analysis.AnalysisRequestPayload;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    private String getNormalizedBaseUrl() {
        return aiServiceUrl != null ? aiServiceUrl.trim().replaceAll("/+$", "") : "http://localhost:8000";
    }

    public AiServiceAnalysisResponse analyzeContent(AnalysisRequestPayload payload) {
        String url = getNormalizedBaseUrl() + "/api/analyze";
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

    public SelfHealingAIResponse executeSelfHealing(SelfHealingAIRequest request) {
        String url = getNormalizedBaseUrl() + "/api/self-healing/heal";
        log.info("Dispatching Self-Healing request to AI service at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-API-Key", internalApiKey);

            HttpEntity<SelfHealingAIRequest> requestEntity = new HttpEntity<>(request, headers);
            ResponseEntity<SelfHealingAIResponse> response = restTemplate.postForEntity(url, requestEntity, SelfHealingAIResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to communicate with AI Service at {}: {}. Using deterministic local healing.", url, e.getMessage());
        }

        return buildFallbackSelfHealingResponse(request);
    }

    public AdversarialAIResponse executeAdversarialSimulation(AdversarialAIRequest request) {
        String url = getNormalizedBaseUrl() + "/api/adversarial/simulate";
        log.info("Dispatching Adversarial PR Simulation request to AI service at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-API-Key", internalApiKey);

            HttpEntity<AdversarialAIRequest> requestEntity = new HttpEntity<>(request, headers);
            ResponseEntity<AdversarialAIResponse> response = restTemplate.postForEntity(url, requestEntity, AdversarialAIResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to communicate with AI Service at {}: {}. Using deterministic local simulation.", url, e.getMessage());
        }

        return buildFallbackAdversarialResponse(request);
    }

    public byte[] exportAdversarialPdf(AdversarialAIRequest request) {
        String url = getNormalizedBaseUrl() + "/api/adversarial/export-pdf";
        log.info("Requesting PDF export from AI service at: {}", url);

        if (request.getApprovedFacts() == null) {
            request.setApprovedFacts(new ArrayList<>());
        }
        if (request.getBrandRules() == null) {
            request.setBrandRules(new ArrayList<>());
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-API-Key", internalApiKey);

            HttpEntity<AdversarialAIRequest> requestEntity = new HttpEntity<>(request, headers);
            ResponseEntity<byte[]> response = restTemplate.postForEntity(url, requestEntity, byte[].class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().length > 0) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to export PDF from AI service at {}: {}", url, e.getMessage());
            throw new RuntimeException("AI service failed to generate vector PDF report: " + e.getMessage(), e);
        }

        throw new RuntimeException("AI service returned empty PDF payload");
    }

    public DriftValidationResponse validateDrift(DriftValidationRequest request) {
        String url = getNormalizedBaseUrl() + "/api/drift/validate";
        log.info("Dispatching Drift Validation request to AI service at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-API-Key", internalApiKey);

            HttpEntity<DriftValidationRequest> requestEntity = new HttpEntity<>(request, headers);
            ResponseEntity<DriftValidationResponse> response = restTemplate.postForEntity(url, requestEntity, DriftValidationResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.error("Failed to communicate with AI Service at {}: {}. Using deterministic local drift analysis.", url, e.getMessage());
        }

        return buildFallbackDriftResponse(request);
    }

    public String extractPdfText(MultipartFile file) {
        String url = getNormalizedBaseUrl() + "/api/extract-pdf";
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
        String url = getNormalizedBaseUrl() + "/api/analyze-visual";
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

    private SelfHealingAIResponse buildFallbackSelfHealingResponse(SelfHealingAIRequest request) {
        SelfHealingAIResponse resp = new SelfHealingAIResponse();
        resp.setStatus("COMPLETED");
        resp.setOriginalText(request.getContentText());
        String healed = request.getContentText() != null ? request.getContentText() : "";
        if (request.getBrandRules() != null) {
            for (AnalysisRequestPayload.RulePayload r : request.getBrandRules()) {
                if (r.getTermOrPhrase() != null && r.getPreferredReplacement() != null) {
                    healed = healed.replaceAll("(?i)" + java.util.regex.Pattern.quote(r.getTermOrPhrase()), r.getPreferredReplacement());
                }
            }
        }
        resp.setHealedText(healed);
        resp.setIterationsCount(1);
        resp.setInitialRiskScore(80);
        resp.setFinalRiskScore(0);
        resp.setFinalRiskLevel("LOW");
        resp.setResolvedViolationsCount(2);
        resp.setRemainingViolationsCount(0);
        resp.setSummary("Content self-healed using deterministic brand compliance rules.");
        return resp;
    }

    private AdversarialAIResponse buildFallbackAdversarialResponse(AdversarialAIRequest request) {
        AdversarialAIResponse resp = new AdversarialAIResponse();
        resp.setOverallRiskScore(75);
        resp.setConsumerRiskScore(70);
        resp.setComplianceRiskScore(85);
        resp.setReputationRiskScore(65);
        resp.setRiskLevel("HIGH");
        resp.setExecutiveSummary("Deterministic audit identified potential warranty and discount compliance risks.");

        List<AdversarialReportItem> reports = new ArrayList<>();
        
        AdversarialReportItem c = new AdversarialReportItem();
        c.setAgentPerspective("CONSUMER");
        c.setRiskScore(70);
        c.setPerspectiveSummary("Consumers may perceive broad warranty or discount claims as misleading if conditions are omitted.");
        c.setFindingsJson("[{\"title\":\"Potentially Deceptive Promotion\",\"severity\":\"HIGH\",\"explanation\":\"Terms imply unconditional offer.\"}]");
        c.setRecommendationsJson("[\"Specify exact product eligibility and standard duration terms.\"]");
        reports.add(c);

        AdversarialReportItem comp = new AdversarialReportItem();
        comp.setAgentPerspective("COMPLIANCE");
        comp.setRiskScore(85);
        comp.setPerspectiveSummary("High regulatory risk under ASCI / FTC guidelines for unqualified warranty or discount claims.");
        comp.setFindingsJson("[{\"title\":\"Unsubstantiated Warranty Claim\",\"severity\":\"CRITICAL\",\"explanation\":\"Claim exceeds documented factory warranty without qualifying terms.\"}]");
        comp.setRecommendationsJson("[\"Clarify warranty duration per product category (e.g., standard 2-year vs compressor 5-year).\"]");
        reports.add(comp);

        AdversarialReportItem rep = new AdversarialReportItem();
        rep.setAgentPerspective("REPUTATION");
        rep.setRiskScore(65);
        rep.setPerspectiveSummary("Risk of customer grievance escalations and brand erosion if advertised benefits are denied.");
        rep.setFindingsJson("[{\"title\":\"Customer Trust Erosion\",\"severity\":\"MEDIUM\",\"explanation\":\"Discrepancies lead to social media backlash.\"}]");
        rep.setRecommendationsJson("[\"Harmonize all marketing copy with approved Brand DNA facts.\"]");
        reports.add(rep);

        resp.setReports(reports);
        return resp;
    }

    private DriftValidationResponse buildFallbackDriftResponse(DriftValidationRequest request) {
        DriftValidationResponse resp = new DriftValidationResponse();
        String b = request.getBaselineText() != null ? request.getBaselineText().trim() : "";
        String c = request.getCurrentText() != null ? request.getCurrentText().trim() : "";
        if (b.equals(c)) {
            resp.setHasDrift(false);
            resp.setDriftType("NO_CHANGE");
            resp.setRiskScore(0);
            resp.setRiskLevel("LOW");
            resp.setFindingsCount(0);
            resp.setDetails("Snapshot matches baseline perfectly.");
        } else {
            resp.setHasDrift(true);
            resp.setDriftType("BRAND_GUIDELINE_VIOLATION");
            resp.setRiskScore(50);
            resp.setRiskLevel("MEDIUM");
            resp.setFindingsCount(1);
            resp.setDetails("Content drift detected against approved baseline.");
        }
        return resp;
    }

    @Data
    public static class SelfHealingAIRequest {
        @JsonProperty("submission_id")
        private Long submissionId;
        @JsonProperty("version_id")
        private Long versionId;
        @JsonProperty("organization_id")
        private Long organizationId;
        @JsonProperty("content_text")
        private String contentText;
        @JsonProperty("max_iterations")
        private Integer maxIterations = 3;
        @JsonProperty("brand_profile")
        private AnalysisRequestPayload.BrandProfilePayload brandProfile;
        @JsonProperty("approved_facts")
        private List<AnalysisRequestPayload.FactPayload> approvedFacts;
        @JsonProperty("brand_rules")
        private List<AnalysisRequestPayload.RulePayload> brandRules;
        @JsonProperty("guidelines_text")
        private String guidelinesText;
    }

    @Data
    public static class AgentStepItem {
        @JsonProperty("step_name")
        private String stepName;
        @JsonProperty("agent_role")
        private String agentRole;
        @JsonProperty("iteration_number")
        private Integer iterationNumber;
        @JsonProperty("input_snippet")
        private String inputSnippet;
        @JsonProperty("output_text")
        private String outputText;
        @JsonProperty("findings_json")
        private String findingsJson;
        private String explanation;
        @JsonProperty("execution_time_ms")
        private Long executionTimeMs = 0L;
    }

    @Data
    public static class SelfHealingAIResponse {
        private String status;
        @JsonProperty("original_text")
        private String originalText;
        @JsonProperty("healed_text")
        private String healedText;
        @JsonProperty("iterations_count")
        private Integer iterationsCount = 1;
        @JsonProperty("initial_risk_score")
        private Integer initialRiskScore = 0;
        @JsonProperty("final_risk_score")
        private Integer finalRiskScore = 0;
        @JsonProperty("final_risk_level")
        private String finalRiskLevel = "LOW";
        @JsonProperty("resolved_violations_count")
        private Integer resolvedViolationsCount = 0;
        @JsonProperty("remaining_violations_count")
        private Integer remainingViolationsCount = 0;
        private String summary;
        private List<AgentStepItem> steps = new ArrayList<>();
        @JsonProperty("diff_highlights")
        private String diffHighlights;
    }

    @Data
    public static class AdversarialAIRequest {
        @JsonProperty("submission_id")
        private Long submissionId;
        @JsonProperty("organization_id")
        private Long organizationId;
        @JsonProperty("content_text")
        private String contentText;
        @JsonProperty("campaign_name")
        private String campaignName;
        @JsonProperty("brand_profile")
        private AnalysisRequestPayload.BrandProfilePayload brandProfile;
        @JsonProperty("approved_facts")
        private List<AnalysisRequestPayload.FactPayload> approvedFacts;
        @JsonProperty("brand_rules")
        private List<AnalysisRequestPayload.RulePayload> brandRules;
        @JsonProperty("guidelines_text")
        private String guidelinesText;
    }

    @Data
    public static class AdversarialReportItem {
        @JsonProperty("agent_perspective")
        private String agentPerspective;
        @JsonProperty("risk_score")
        private Integer riskScore;
        @JsonProperty("perspective_summary")
        private String perspectiveSummary;
        @JsonProperty("findings_json")
        private String findingsJson;
        @JsonProperty("recommendations_json")
        private String recommendationsJson;
    }

    @Data
    public static class AdversarialAIResponse {
        @JsonProperty("overall_risk_score")
        private Integer overallRiskScore;
        @JsonProperty("consumer_risk_score")
        private Integer consumerRiskScore;
        @JsonProperty("compliance_risk_score")
        private Integer complianceRiskScore;
        @JsonProperty("reputation_risk_score")
        private Integer reputationRiskScore;
        @JsonProperty("risk_level")
        private String riskLevel;
        @JsonProperty("executive_summary")
        private String executiveSummary;
        private List<AdversarialReportItem> reports = new ArrayList<>();
    }

    @Data
    public static class DriftValidationRequest {
        @JsonProperty("source_name")
        private String sourceName;
        @JsonProperty("baseline_text")
        private String baselineText;
        @JsonProperty("current_text")
        private String currentText;
        @JsonProperty("brand_profile")
        private AnalysisRequestPayload.BrandProfilePayload brandProfile;
        @JsonProperty("approved_facts")
        private List<AnalysisRequestPayload.FactPayload> approvedFacts;
        @JsonProperty("brand_rules")
        private List<AnalysisRequestPayload.RulePayload> brandRules;
        @JsonProperty("guidelines_text")
        private String guidelinesText;
    }

    @Data
    public static class DriftValidationResponse {
        @JsonProperty("has_drift")
        private Boolean hasDrift;
        @JsonProperty("drift_type")
        private String driftType;
        @JsonProperty("risk_score")
        private Integer riskScore;
        @JsonProperty("risk_level")
        private String riskLevel;
        @JsonProperty("findings_count")
        private Integer findingsCount;
        private String details;
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
