package com.brandsutra.service;

import com.brandsutra.client.AiServiceClient;
import com.brandsutra.dto.adversarial.AdversarialReportDto;
import com.brandsutra.dto.adversarial.AdversarialRequest;
import com.brandsutra.dto.adversarial.AdversarialSimulationDto;
import com.brandsutra.dto.analysis.AnalysisRequestPayload;
import com.brandsutra.entity.*;
import com.brandsutra.exception.BadRequestException;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.exception.UnauthorizedException;
import com.brandsutra.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdversarialSimulationService {

    private final AdversarialSimulationRepository simulationRepository;
    private final AdversarialAgentReportRepository reportRepository;
    private final ContentSubmissionRepository submissionRepository;
    private final ContentVersionRepository versionRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final BrandFactRepository brandFactRepository;
    private final BrandRuleRepository brandRuleRepository;
    private final BrandGuidelineRepository brandGuidelineRepository;
    private final OrganizationMemberRepository memberRepository;
    private final AuditService auditService;
    private final AiServiceClient aiServiceClient;

    @Transactional
    public AdversarialSimulationDto runSimulation(AdversarialRequest request, User user) {
        log.info("Running Adversarial PR Simulation for submissionId: {}", request.getSubmissionId());

        ContentSubmission submission = null;
        Organization org = null;

        if (request.getSubmissionId() != null) {
            submission = submissionRepository.findById(request.getSubmissionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + request.getSubmissionId()));
            org = submission.getOrganization();
        }

        if (org == null) {
            List<OrganizationMember> members = memberRepository.findByUserId(user.getId());
            if (members.isEmpty()) {
                throw new BadRequestException("User does not belong to any organization");
            }
            org = members.get(0).getOrganization();
        }

        final Long orgId = org.getId();
        boolean isMember = memberRepository.findByUserId(user.getId()).stream()
                .anyMatch(m -> m.getOrganization().getId().equals(orgId));
        if (!isMember) {
            throw new UnauthorizedException("User not authorized for this organization");
        }

        String contentToSimulate = request.getContentText();
        if ((contentToSimulate == null || contentToSimulate.isBlank()) && submission != null) {
            ContentVersion latestVersion = versionRepository.findBySubmissionIdOrderByVersionNumberDesc(submission.getId())
                    .stream().findFirst().orElse(null);
            if (latestVersion != null) {
                contentToSimulate = latestVersion.getContentText();
            }
        }
        if (contentToSimulate == null || contentToSimulate.isBlank()) {
            throw new BadRequestException("Content text cannot be empty for Adversarial Simulation");
        }

        // Fetch Brand DNA
        BrandProfile profile = brandProfileRepository.findByOrganizationId(orgId).orElse(null);
        List<BrandFact> approvedFacts = brandFactRepository.findByOrganizationIdAndStatus(orgId, "APPROVED");
        List<BrandRule> activeRules = brandRuleRepository.findByOrganizationIdAndIsActiveTrue(orgId);
        List<BrandGuideline> guidelines = brandGuidelineRepository.findByOrganizationId(orgId);

        StringBuilder guidelinesText = new StringBuilder();
        for (BrandGuideline g : guidelines) {
            guidelinesText.append("=== ").append(g.getTitle()).append(" ===\n")
                    .append(g.getContentText()).append("\n\n");
        }

        // Build AI Request
        AiServiceClient.AdversarialAIRequest aiReq = new AiServiceClient.AdversarialAIRequest();
        aiReq.setSubmissionId(submission != null ? submission.getId() : null);
        aiReq.setOrganizationId(orgId);
        aiReq.setContentText(contentToSimulate);
        aiReq.setCampaignName(request.getCampaignName() != null ? request.getCampaignName() : "Promotional Campaign");

        if (profile != null) {
            aiReq.setBrandProfile(AnalysisRequestPayload.BrandProfilePayload.builder()
                    .brandName(profile.getBrandName())
                    .voiceTone(profile.getVoiceTone())
                    .mission(profile.getMission())
                    .toneGuidelines(profile.getToneGuidelines())
                    .build());
        }

        aiReq.setApprovedFacts(approvedFacts.stream().map(f -> AnalysisRequestPayload.FactPayload.builder()
                .id(f.getId())
                .category(f.getCategory() != null ? f.getCategory().name() : "GENERAL")
                .factTitle(f.getFactTitle())
                .approvedStatement(f.getApprovedStatement())
                .source(f.getSource())
                .version(f.getVersion())
                .build()).collect(Collectors.toList()));

        aiReq.setBrandRules(activeRules.stream().map(r -> AnalysisRequestPayload.RulePayload.builder()
                .id(r.getId())
                .ruleType(r.getRuleType() != null ? r.getRuleType().name() : "BANNED_TERM")
                .termOrPhrase(r.getTermOrPhrase())
                .preferredReplacement(r.getPreferredReplacement())
                .explanation(r.getExplanation())
                .thresholdValue(r.getThresholdValue())
                .severity(r.getSeverity() != null ? r.getSeverity().name() : "HIGH")
                .build()).collect(Collectors.toList()));

        aiReq.setGuidelinesText(guidelinesText.toString());

        // Invoke AI Multi-Perspective Engine
        AiServiceClient.AdversarialAIResponse aiResp = aiServiceClient.executeAdversarialSimulation(aiReq);

        Severity sevLevel = Severity.LOW;
        try {
            if (aiResp.getRiskLevel() != null) {
                sevLevel = Severity.valueOf(aiResp.getRiskLevel().toUpperCase());
            }
        } catch (Exception ignored) {}

        // Persist Simulation Record
        AdversarialSimulation sim = AdversarialSimulation.builder()
                .organization(org)
                .submission(submission)
                .createdBy(user)
                .contentText(contentToSimulate)
                .campaignName(request.getCampaignName() != null ? request.getCampaignName() : "Campaign Risk Audit")
                .overallRiskScore(aiResp.getOverallRiskScore() != null ? aiResp.getOverallRiskScore() : 0)
                .consumerRiskScore(aiResp.getConsumerRiskScore() != null ? aiResp.getConsumerRiskScore() : 0)
                .complianceRiskScore(aiResp.getComplianceRiskScore() != null ? aiResp.getComplianceRiskScore() : 0)
                .reputationRiskScore(aiResp.getReputationRiskScore() != null ? aiResp.getReputationRiskScore() : 0)
                .riskLevel(sevLevel)
                .executiveSummary(aiResp.getExecutiveSummary() != null ? aiResp.getExecutiveSummary() : "Audit completed.")
                .build();

        sim = simulationRepository.save(sim);

        // Persist Individual Perspective Reports
        List<AdversarialAgentReport> reportsToSave = new ArrayList<>();
        if (aiResp.getReports() != null) {
            for (AiServiceClient.AdversarialReportItem item : aiResp.getReports()) {
                AdversarialAgentReport report = AdversarialAgentReport.builder()
                        .simulation(sim)
                        .agentPerspective(item.getAgentPerspective() != null ? item.getAgentPerspective().toUpperCase() : "GENERAL")
                        .riskScore(item.getRiskScore() != null ? item.getRiskScore() : 0)
                        .perspectiveSummary(item.getPerspectiveSummary())
                        .findingsJson(item.getFindingsJson())
                        .recommendationsJson(item.getRecommendationsJson())
                        .build();
                reportsToSave.add(report);
            }
            reportRepository.saveAll(reportsToSave);
        }

        auditService.logAction(org, user, "ADVERSARIAL_SIMULATION_EXECUTED", "ADVERSARIAL_SIMULATION", sim.getId(),
                "Overall Risk Score: " + sim.getOverallRiskScore() + "/100 (" + sim.getRiskLevel() + ")");

        return mapToDto(sim, reportsToSave);
    }

    @Transactional(readOnly = true)
    public AdversarialSimulationDto getSimulation(Long simId, User user) {
        AdversarialSimulation sim = simulationRepository.findById(simId)
                .orElseThrow(() -> new ResourceNotFoundException("Adversarial simulation not found: " + simId));

        verifyOrgAccess(sim.getOrganization().getId(), user);

        List<AdversarialAgentReport> reports = reportRepository.findBySimulationId(simId);
        return mapToDto(sim, reports);
    }

    @Transactional(readOnly = true)
    public List<AdversarialSimulationDto> getSimulationsBySubmission(Long submissionId, User user) {
        ContentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        verifyOrgAccess(sub.getOrganization().getId(), user);

        List<AdversarialSimulation> sims = simulationRepository.findBySubmissionIdOrderByCreatedAtDesc(submissionId);
        return sims.stream().map(s -> {
            List<AdversarialAgentReport> reports = reportRepository.findBySimulationId(s.getId());
            return mapToDto(s, reports);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf(Long simId, User user) {
        AdversarialSimulation sim = simulationRepository.findById(simId)
                .orElseThrow(() -> new ResourceNotFoundException("Adversarial simulation not found: " + simId));

        verifyOrgAccess(sim.getOrganization().getId(), user);

        List<AdversarialAgentReport> reports = reportRepository.findBySimulationId(simId);

        // Build request for PDF export
        AiServiceClient.AdversarialAIRequest aiReq = new AiServiceClient.AdversarialAIRequest();
        aiReq.setContentText(sim.getContentText());
        aiReq.setCampaignName(sim.getCampaignName());
        aiReq.setOrganizationId(sim.getOrganization().getId());
        aiReq.setApprovedFacts(new ArrayList<>());
        aiReq.setBrandRules(new ArrayList<>());

        BrandProfile profile = brandProfileRepository.findByOrganizationId(sim.getOrganization().getId()).orElse(null);
        if (profile != null) {
            aiReq.setBrandProfile(AnalysisRequestPayload.BrandProfilePayload.builder()
                    .brandName(profile.getBrandName())
                    .build());
        }

        return aiServiceClient.exportAdversarialPdf(aiReq);
    }

    private void verifyOrgAccess(Long orgId, User user) {
        boolean isMember = memberRepository.findByUserId(user.getId()).stream()
                .anyMatch(m -> m.getOrganization().getId().equals(orgId));
        if (!isMember) {
            throw new UnauthorizedException("User does not have access to this organization");
        }
    }

    private AdversarialSimulationDto mapToDto(AdversarialSimulation s, List<AdversarialAgentReport> reports) {
        List<AdversarialReportDto> reportDtos = new ArrayList<>();
        if (reports != null) {
            reportDtos = reports.stream().map(r -> AdversarialReportDto.builder()
                    .id(r.getId())
                    .simulationId(s.getId())
                    .agentPerspective(r.getAgentPerspective())
                    .riskScore(r.getRiskScore())
                    .perspectiveSummary(r.getPerspectiveSummary())
                    .findingsJson(r.getFindingsJson())
                    .recommendationsJson(r.getRecommendationsJson())
                    .createdAt(r.getCreatedAt())
                    .build()).collect(Collectors.toList());
        }

        return AdversarialSimulationDto.builder()
                .id(s.getId())
                .organizationId(s.getOrganization().getId())
                .submissionId(s.getSubmission() != null ? s.getSubmission().getId() : null)
                .createdById(s.getCreatedBy().getId())
                .createdByName(s.getCreatedBy().getFullName())
                .contentText(s.getContentText())
                .campaignName(s.getCampaignName())
                .overallRiskScore(s.getOverallRiskScore())
                .consumerRiskScore(s.getConsumerRiskScore())
                .complianceRiskScore(s.getComplianceRiskScore())
                .reputationRiskScore(s.getReputationRiskScore())
                .riskLevel(s.getRiskLevel())
                .executiveSummary(s.getExecutiveSummary())
                .createdAt(s.getCreatedAt())
                .reports(reportDtos)
                .build();
    }
}
