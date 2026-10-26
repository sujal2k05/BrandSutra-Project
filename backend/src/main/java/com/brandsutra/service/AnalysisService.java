package com.brandsutra.service;

import com.brandsutra.client.AiServiceClient;
import com.brandsutra.dto.analysis.AnalysisRequestPayload;
import com.brandsutra.dto.analysis.AnalysisResponseDto;
import com.brandsutra.dto.analysis.FindingDto;
import com.brandsutra.entity.*;
import com.brandsutra.exception.BadRequestException;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final ContentSubmissionRepository submissionRepository;
    private final ContentVersionRepository versionRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final BrandFactRepository brandFactRepository;
    private final BrandRuleRepository brandRuleRepository;
    private final BrandGuidelineRepository brandGuidelineRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final AiFindingRepository aiFindingRepository;
    private final AiServiceClient aiServiceClient;
    private final AuditService auditService;

    @Transactional
    public AnalysisResponseDto analyzeSubmission(Long submissionId, User user) {
        ContentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (submission.getCurrentVersionId() == null) {
            throw new BadRequestException("Submission has no active content version.");
        }

        ContentVersion version = versionRepository.findById(submission.getCurrentVersionId())
                .orElseThrow(() -> new ResourceNotFoundException("Active version not found: " + submission.getCurrentVersionId()));

        Long orgId = submission.getOrganization().getId();

        // 1. Gather Approved Brand DNA Knowledge
        BrandProfile profile = brandProfileRepository.findByOrganizationId(orgId).orElse(null);
        List<BrandFact> approvedFacts = brandFactRepository.findByOrganizationIdAndStatus(orgId, "APPROVED");
        List<BrandRule> activeRules = brandRuleRepository.findByOrganizationIdAndIsActiveTrue(orgId);
        List<BrandGuideline> approvedGuidelines = brandGuidelineRepository.findByOrganizationIdAndIsApprovedTrue(orgId);

        StringBuilder guidelinesText = new StringBuilder();
        for (BrandGuideline g : approvedGuidelines) {
            guidelinesText.append("=== Guideline: ").append(g.getTitle()).append(" ===\n")
                    .append(g.getContentText()).append("\n\n");
        }

        // 2. Build Analysis Request Payload
        AnalysisRequestPayload payload = AnalysisRequestPayload.builder()
                .submissionId(submission.getId())
                .versionId(version.getId())
                .organizationId(orgId)
                .submittedText(version.getContentText())
                .contentType(submission.getContentType().name())
                .marketingChannel(submission.getMarketingChannel().name())
                .brandProfile(profile != null ? AnalysisRequestPayload.BrandProfilePayload.builder()
                        .brandName(profile.getBrandName())
                        .voiceTone(profile.getVoiceTone())
                        .mission(profile.getMission())
                        .toneGuidelines(profile.getToneGuidelines())
                        .build() : null)
                .approvedFacts(approvedFacts.stream().map(f -> AnalysisRequestPayload.FactPayload.builder()
                        .id(f.getId())
                        .category(f.getCategory().name())
                        .factTitle(f.getFactTitle())
                        .approvedStatement(f.getApprovedStatement())
                        .source(f.getSource())
                        .version(f.getVersion())
                        .build()).collect(Collectors.toList()))
                .brandRules(activeRules.stream().map(r -> AnalysisRequestPayload.RulePayload.builder()
                        .id(r.getId())
                        .ruleType(r.getRuleType().name())
                        .termOrPhrase(r.getTermOrPhrase())
                        .preferredReplacement(r.getPreferredReplacement())
                        .explanation(r.getExplanation())
                        .thresholdValue(r.getThresholdValue())
                        .severity(r.getSeverity().name())
                        .build()).collect(Collectors.toList()))
                .guidelinesText(guidelinesText.toString())
                .build();

        // 3. Dispatch to FastAPI Microservice (Rule + Gemini Hybrid Verification)
        AiServiceClient.AiServiceAnalysisResponse aiResponse = aiServiceClient.analyzeContent(payload);

        // 4. Evidence Validation & Fact Integrity Verification
        Map<Long, BrandFact> factsMap = approvedFacts.stream()
                .collect(Collectors.toMap(BrandFact::getId, f -> f));

        int low = 0, med = 0, high = 0, crit = 0;
        List<AiFinding> findingsToSave = new ArrayList<>();

        for (AiServiceClient.FindingItem item : aiResponse.getFindings()) {
            Severity sev;
            try {
                sev = Severity.valueOf(item.getSeverity().toUpperCase());
            } catch (Exception e) {
                sev = Severity.MEDIUM;
            }

            EvidenceStatus evStatus;
            try {
                evStatus = EvidenceStatus.valueOf(item.getEvidenceStatus().toUpperCase());
            } catch (Exception e) {
                evStatus = EvidenceStatus.REQUIRES_VERIFICATION;
            }

            // Validate evidence reference
            BrandFact linkedFact = null;
            String evText = item.getEvidenceText();
            String srcName = item.getSourceName();
            String srcVer = item.getSourceVersion();

            if (item.getEvidenceId() != null && factsMap.containsKey(item.getEvidenceId())) {
                linkedFact = factsMap.get(item.getEvidenceId());
                evText = linkedFact.getApprovedStatement();
                srcName = linkedFact.getSource();
                srcVer = linkedFact.getVersion();
            } else if (item.getEvidenceId() != null) {
                // Evidence ID not found in organization's approved facts
                log.warn("AI citation fact ID {} is invalid or belongs to another organization. Demoting to REQUIRES_VERIFICATION.", item.getEvidenceId());
                evStatus = EvidenceStatus.REQUIRES_VERIFICATION;
            }

            switch (sev) {
                case CRITICAL -> crit++;
                case HIGH -> high++;
                case MEDIUM -> med++;
                case LOW -> low++;
            }

            AiFinding finding = AiFinding.builder()
                    .version(version)
                    .category(item.getCategory() != null ? item.getCategory().toUpperCase() : "GENERAL")
                    .issue(item.getIssue() != null ? item.getIssue() : "Brand governance violation detected")
                    .severity(sev)
                    .evidenceStatus(evStatus)
                    .explanation(item.getExplanation() != null ? item.getExplanation() : "")
                    .excerpt(item.getExcerpt())
                    .evidence(linkedFact)
                    .evidenceText(evText)
                    .sourceName(srcName)
                    .sourceVersion(srcVer)
                    .suggestedCorrection(item.getSuggestedCorrection())
                    .confidence(item.getConfidence() != null ? item.getConfidence() : 0.95)
                    .isDismissed(false)
                    .build();

            findingsToSave.add(finding);
        }

        // 5. Calculate Brand Risk Score
        int calculatedScore = Math.min(100, (crit * 40) + (high * 25) + (med * 15) + (low * 5));
        Severity riskLevel;
        if (calculatedScore <= 20) riskLevel = Severity.LOW;
        else if (calculatedScore <= 40) riskLevel = Severity.MEDIUM;
        else if (calculatedScore <= 70) riskLevel = Severity.HIGH;
        else riskLevel = Severity.CRITICAL;

        // 6. Save Analysis Result
        AnalysisResult analysisResult = AnalysisResult.builder()
                .version(version)
                .totalFindings(findingsToSave.size())
                .lowCount(low)
                .mediumCount(med)
                .highCount(high)
                .criticalCount(crit)
                .riskScore(calculatedScore)
                .riskLevel(riskLevel)
                .status("COMPLETED")
                .analysisSummary(aiResponse.getSummary() != null ? aiResponse.getSummary() : "Analysis completed.")
                .executionTimeMs(aiResponse.getExecutionTimeMs() != null ? aiResponse.getExecutionTimeMs() : 50L)
                .build();
        analysisResult = analysisResultRepository.save(analysisResult);

        // Associate analysisResult with findings
        for (AiFinding f : findingsToSave) {
            f.setAnalysis(analysisResult);
        }
        aiFindingRepository.saveAll(findingsToSave);

        // 7. Update Version and Submission Statuses
        version.setRiskScore(calculatedScore);
        version.setRiskLevel(riskLevel);
        version.setStatus(SubmissionStatus.ANALYZED);
        versionRepository.save(version);

        submission.setOverallStatus(SubmissionStatus.ANALYZED);
        submissionRepository.save(submission);

        auditService.logAction(submission.getOrganization(), user, "CONTENT_ANALYZED", "CONTENT_VERSION", version.getId(),
                "Completed AI governance analysis for '" + submission.getTitle() + "' (Risk: " + calculatedScore + "/100)");

        return mapToAnalysisDto(analysisResult, findingsToSave);
    }

    @Transactional(readOnly = true)
    public AnalysisResponseDto getLatestAnalysisForSubmission(Long submissionId) {
        ContentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (submission.getCurrentVersionId() == null) {
            throw new ResourceNotFoundException("No versions found for submission: " + submissionId);
        }

        return getAnalysisForVersion(submission.getCurrentVersionId());
    }

    @Transactional(readOnly = true)
    public AnalysisResponseDto getAnalysisForVersion(Long versionId) {
        AnalysisResult result = analysisResultRepository.findByVersionId(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("No analysis result found for version ID: " + versionId));

        List<AiFinding> findings = aiFindingRepository.findByVersionId(versionId);
        return mapToAnalysisDto(result, findings);
    }

    @Transactional
    public void dismissFinding(Long findingId, User user) {
        AiFinding finding = aiFindingRepository.findById(findingId)
                .orElseThrow(() -> new ResourceNotFoundException("Finding not found: " + findingId));
        finding.setIsDismissed(true);
        aiFindingRepository.save(finding);

        auditService.logAction(finding.getVersion().getSubmission().getOrganization(), user,
                "FINDING_DISMISSED", "AI_FINDING", finding.getId(), "Dismissed finding: " + finding.getIssue());
    }

    private AnalysisResponseDto mapToAnalysisDto(AnalysisResult res, List<AiFinding> findings) {
        List<FindingDto> findingDtos = findings.stream().map(f -> FindingDto.builder()
                .id(f.getId())
                .category(f.getCategory())
                .issue(f.getIssue())
                .severity(f.getSeverity())
                .evidenceStatus(f.getEvidenceStatus())
                .explanation(f.getExplanation())
                .excerpt(f.getExcerpt())
                .evidenceId(f.getEvidence() != null ? f.getEvidence().getId() : null)
                .evidenceText(f.getEvidenceText())
                .sourceName(f.getSourceName())
                .sourceVersion(f.getSourceVersion())
                .suggestedCorrection(f.getSuggestedCorrection())
                .confidence(f.getConfidence())
                .isDismissed(f.getIsDismissed())
                .build()).collect(Collectors.toList());

        return AnalysisResponseDto.builder()
                .id(res.getId())
                .versionId(res.getVersion().getId())
                .totalFindings(res.getTotalFindings())
                .lowCount(res.getLowCount())
                .mediumCount(res.getMediumCount())
                .highCount(res.getHighCount())
                .criticalCount(res.getCriticalCount())
                .riskScore(res.getRiskScore())
                .riskLevel(res.getRiskLevel())
                .status(res.getStatus())
                .analysisSummary(res.getAnalysisSummary())
                .executionTimeMs(res.getExecutionTimeMs())
                .findings(findingDtos)
                .build();
    }
}
