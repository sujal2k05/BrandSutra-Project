package com.brandsutra.service;

import com.brandsutra.client.AiServiceClient;
import com.brandsutra.dto.analysis.AnalysisRequestPayload;
import com.brandsutra.dto.selfhealing.AgentStepDto;
import com.brandsutra.dto.selfhealing.SelfHealingRequest;
import com.brandsutra.dto.selfhealing.SelfHealingSessionDto;
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
public class SelfHealingService {

    private final SelfHealingSessionRepository sessionRepository;
    private final SelfHealingAgentStepRepository stepRepository;
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
    public SelfHealingSessionDto startSession(SelfHealingRequest request, User user) {
        log.info("Starting Agentic Self-Healing session for submissionId: {}, versionId: {}",
                request.getSubmissionId(), request.getVersionId());

        ContentSubmission submission = null;
        ContentVersion version = null;
        Organization org = null;

        if (request.getSubmissionId() != null) {
            submission = submissionRepository.findById(request.getSubmissionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + request.getSubmissionId()));
            org = submission.getOrganization();
        }

        if (request.getVersionId() != null) {
            version = versionRepository.findById(request.getVersionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Version not found: " + request.getVersionId()));
            if (org == null) {
                org = version.getSubmission().getOrganization();
                submission = version.getSubmission();
            }
        }

        if (org == null) {
            // Find organization user belongs to
            List<OrganizationMember> members = memberRepository.findByUserId(user.getId());
            if (members.isEmpty()) {
                throw new BadRequestException("User does not belong to any organization");
            }
            org = members.get(0).getOrganization();
        }

        // Verify organization membership
        final Long orgId = org.getId();
        boolean isMember = memberRepository.findByUserId(user.getId()).stream()
                .anyMatch(m -> m.getOrganization().getId().equals(orgId));
        if (!isMember) {
            throw new UnauthorizedException("User not authorized for this organization");
        }

        String contentToHeal = request.getContentText();
        if ((contentToHeal == null || contentToHeal.isBlank()) && version != null) {
            contentToHeal = version.getContentText();
        }
        if (contentToHeal == null || contentToHeal.isBlank()) {
            throw new BadRequestException("Content text cannot be empty for Self-Healing");
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

        // Construct AI request
        AiServiceClient.SelfHealingAIRequest aiReq = new AiServiceClient.SelfHealingAIRequest();
        aiReq.setSubmissionId(submission != null ? submission.getId() : null);
        aiReq.setVersionId(version != null ? version.getId() : null);
        aiReq.setOrganizationId(orgId);
        aiReq.setContentText(contentToHeal);
        aiReq.setMaxIterations(request.getMaxIterations() != null ? request.getMaxIterations() : 3);

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

        // Invoke AI Multi-Agent Service
        AiServiceClient.SelfHealingAIResponse aiResp = aiServiceClient.executeSelfHealing(aiReq);

        Severity sevLevel = Severity.LOW;
        try {
            if (aiResp.getFinalRiskLevel() != null) {
                sevLevel = Severity.valueOf(aiResp.getFinalRiskLevel().toUpperCase());
            }
        } catch (Exception ignored) {}

        // Persist Session
        SelfHealingSession session = SelfHealingSession.builder()
                .organization(org)
                .submission(submission)
                .sourceVersion(version)
                .createdBy(user)
                .originalText(contentToHeal)
                .healedText(aiResp.getHealedText() != null ? aiResp.getHealedText() : contentToHeal)
                .iterationsCount(aiResp.getIterationsCount() != null ? aiResp.getIterationsCount() : 1)
                .status(HealingSessionStatus.COMPLETED)
                .initialRiskScore(aiResp.getInitialRiskScore() != null ? aiResp.getInitialRiskScore() : 0)
                .finalRiskScore(aiResp.getFinalRiskScore() != null ? aiResp.getFinalRiskScore() : 0)
                .finalRiskLevel(sevLevel)
                .resolvedViolationsCount(aiResp.getResolvedViolationsCount() != null ? aiResp.getResolvedViolationsCount() : 0)
                .remainingViolationsCount(aiResp.getRemainingViolationsCount() != null ? aiResp.getRemainingViolationsCount() : 0)
                .summary(aiResp.getSummary() != null ? aiResp.getSummary() : "Agentic self-healing complete.")
                .build();

        session = sessionRepository.save(session);

        // Persist Agent Steps
        List<SelfHealingAgentStep> stepsToSave = new ArrayList<>();
        if (aiResp.getSteps() != null) {
            for (AiServiceClient.AgentStepItem stepItem : aiResp.getSteps()) {
                AgentStepName stepName = AgentStepName.DETECTION;
                try {
                    if (stepItem.getStepName() != null) {
                        stepName = AgentStepName.valueOf(stepItem.getStepName().toUpperCase());
                    }
                } catch (Exception ignored) {}

                SelfHealingAgentStep step = SelfHealingAgentStep.builder()
                        .session(session)
                        .iterationNumber(stepItem.getIterationNumber() != null ? stepItem.getIterationNumber() : 1)
                        .agentName(stepName)
                        .status("SUCCESS")
                        .inputSnippet(stepItem.getInputSnippet())
                        .outputText(stepItem.getOutputText())
                        .findingsJson(stepItem.getFindingsJson())
                        .explanation(stepItem.getExplanation())
                        .executionTimeMs(stepItem.getExecutionTimeMs() != null ? stepItem.getExecutionTimeMs() : 0L)
                        .build();
                stepsToSave.add(step);
            }
            stepRepository.saveAll(stepsToSave);
        }

        auditService.logAction(org, user, "SELF_HEALING_INITIATED", "SELF_HEALING_SESSION", session.getId(),
                "Self-healing completed with " + session.getIterationsCount() + " iterations.");

        return mapToDto(session, stepsToSave, aiResp.getDiffHighlights());
    }

    @Transactional
    public SelfHealingSessionDto acceptSession(Long sessionId, User user) {
        SelfHealingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Self-healing session not found: " + sessionId));

        // Organization verification
        verifyOrgAccess(session.getOrganization().getId(), user);

        session.setStatus(HealingSessionStatus.ACCEPTED);
        sessionRepository.save(session);

        // Grounding & Immutable Versioning:
        // Do NOT overwrite existing version. Create an incremented ContentVersion.
        // Status remains PENDING/SUBMITTED so final approval authority stays with the Human Reviewer!
        if (session.getSubmission() != null) {
            ContentSubmission submission = session.getSubmission();
            int currentMaxVersion = versionRepository.findBySubmissionIdOrderByVersionNumberDesc(submission.getId())
                    .stream().mapToInt(ContentVersion::getVersionNumber).max().orElse(1);

            ContentVersion newVersion = ContentVersion.builder()
                    .submission(submission)
                    .versionNumber(currentMaxVersion + 1)
                    .contentText(session.getHealedText())
                    .riskScore(session.getFinalRiskScore())
                    .riskLevel(session.getFinalRiskLevel())
                    .status(SubmissionStatus.PENDING_REVIEW)
                    .createdBy(user)
                    .build();

            newVersion = versionRepository.save(newVersion);

            submission.setCurrentVersionId(newVersion.getId());
            submission.setOverallStatus(SubmissionStatus.PENDING_REVIEW);
            submissionRepository.save(submission);

            auditService.logAction(session.getOrganization(), user, "SELF_HEALING_ACCEPTED", "CONTENT_VERSION", newVersion.getId(),
                    "Created revision v" + newVersion.getVersionNumber() + " from Self-Healing Session #" + session.getId() + " - pending Human Reviewer approval.");
        }

        return getSession(sessionId, user);
    }

    @Transactional
    public SelfHealingSessionDto rejectSession(Long sessionId, User user) {
        SelfHealingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Self-healing session not found: " + sessionId));

        verifyOrgAccess(session.getOrganization().getId(), user);

        session.setStatus(HealingSessionStatus.REJECTED);
        sessionRepository.save(session);

        auditService.logAction(session.getOrganization(), user, "SELF_HEALING_REJECTED", "SELF_HEALING_SESSION", session.getId(),
                "Rejected self-healed revision.");

        return getSession(sessionId, user);
    }

    @Transactional(readOnly = true)
    public SelfHealingSessionDto getSession(Long sessionId, User user) {
        SelfHealingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Self-healing session not found: " + sessionId));

        verifyOrgAccess(session.getOrganization().getId(), user);

        List<SelfHealingAgentStep> steps = stepRepository.findBySessionIdOrderByIterationNumberAscCreatedAtAsc(sessionId);
        return mapToDto(session, steps, null);
    }

    @Transactional(readOnly = true)
    public List<SelfHealingSessionDto> getSessionsBySubmission(Long submissionId, User user) {
        ContentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        verifyOrgAccess(sub.getOrganization().getId(), user);

        List<SelfHealingSession> sessions = sessionRepository.findBySubmissionIdOrderByCreatedAtDesc(submissionId);
        return sessions.stream().map(s -> {
            List<SelfHealingAgentStep> steps = stepRepository.findBySessionIdOrderByIterationNumberAscCreatedAtAsc(s.getId());
            return mapToDto(s, steps, null);
        }).collect(Collectors.toList());
    }

    private void verifyOrgAccess(Long orgId, User user) {
        boolean isMember = memberRepository.findByUserId(user.getId()).stream()
                .anyMatch(m -> m.getOrganization().getId().equals(orgId));
        if (!isMember) {
            throw new UnauthorizedException("User does not have access to this organization");
        }
    }

    private SelfHealingSessionDto mapToDto(SelfHealingSession s, List<SelfHealingAgentStep> steps, String diff) {
        List<AgentStepDto> stepDtos = new ArrayList<>();
        if (steps != null) {
            stepDtos = steps.stream().map(step -> AgentStepDto.builder()
                    .id(step.getId())
                    .sessionId(s.getId())
                    .iterationNumber(step.getIterationNumber())
                    .agentName(step.getAgentName())
                    .status(step.getStatus())
                    .inputSnippet(step.getInputSnippet())
                    .outputText(step.getOutputText())
                    .findingsJson(step.getFindingsJson())
                    .explanation(step.getExplanation())
                    .executionTimeMs(step.getExecutionTimeMs())
                    .createdAt(step.getCreatedAt())
                    .build()).collect(Collectors.toList());
        }

        return SelfHealingSessionDto.builder()
                .id(s.getId())
                .organizationId(s.getOrganization().getId())
                .submissionId(s.getSubmission() != null ? s.getSubmission().getId() : null)
                .sourceVersionId(s.getSourceVersion() != null ? s.getSourceVersion().getId() : null)
                .createdById(s.getCreatedBy().getId())
                .createdByName(s.getCreatedBy().getFullName())
                .originalText(s.getOriginalText())
                .healedText(s.getHealedText())
                .iterationsCount(s.getIterationsCount())
                .status(s.getStatus())
                .initialRiskScore(s.getInitialRiskScore())
                .finalRiskScore(s.getFinalRiskScore())
                .finalRiskLevel(s.getFinalRiskLevel())
                .resolvedViolationsCount(s.getResolvedViolationsCount())
                .remainingViolationsCount(s.getRemainingViolationsCount())
                .summary(s.getSummary())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .steps(stepDtos)
                .diffHighlights(diff)
                .build();
    }
}
