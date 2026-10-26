package com.brandsutra.service;

import com.brandsutra.dto.approval.ApprovalDecisionDto;
import com.brandsutra.dto.approval.ApprovalRequest;
import com.brandsutra.dto.content.SubmissionResponseDto;
import com.brandsutra.entity.*;
import com.brandsutra.exception.BadRequestException;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.repository.ApprovalDecisionRepository;
import com.brandsutra.repository.ContentSubmissionRepository;
import com.brandsutra.repository.ContentVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ContentSubmissionRepository submissionRepository;
    private final ContentVersionRepository versionRepository;
    private final ApprovalDecisionRepository decisionRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<SubmissionResponseDto> getPendingSubmissions(Long orgId) {
        List<ContentSubmission> submissions = submissionRepository.findByOrganizationIdAndOverallStatusOrderByCreatedAtDesc(
                orgId, SubmissionStatus.PENDING_REVIEW
        );
        return submissions.stream().map(sub -> {
            ContentVersion currentVersion = sub.getCurrentVersionId() != null
                    ? versionRepository.findById(sub.getCurrentVersionId()).orElse(null)
                    : null;
            return mapToSubmissionDto(sub, currentVersion);
        }).collect(Collectors.toList());
    }

    @Transactional
    public SubmissionResponseDto submitForReview(Long submissionId, User user) {
        ContentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (submission.getCurrentVersionId() == null) {
            throw new BadRequestException("Submission has no content version to review.");
        }

        ContentVersion version = versionRepository.findById(submission.getCurrentVersionId())
                .orElseThrow(() -> new ResourceNotFoundException("Active version not found"));

        submission.setOverallStatus(SubmissionStatus.PENDING_REVIEW);
        submissionRepository.save(submission);

        version.setStatus(SubmissionStatus.PENDING_REVIEW);
        versionRepository.save(version);

        auditService.logAction(submission.getOrganization(), user, "SUBMITTED_FOR_REVIEW",
                "CONTENT_SUBMISSION", submission.getId(),
                "Submitted Version " + version.getVersionNumber() + " of '" + submission.getTitle() + "' for human review");

        return mapToSubmissionDto(submission, version);
    }

    @Transactional
    public ApprovalDecisionDto reviewSubmission(Long submissionId, ApprovalRequest request, User reviewer) {
        ContentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (submission.getCurrentVersionId() == null) {
            throw new BadRequestException("Submission has no active version to approve.");
        }

        ContentVersion version = versionRepository.findById(submission.getCurrentVersionId())
                .orElseThrow(() -> new ResourceNotFoundException("Active version not found"));

        SubmissionStatus newStatus;
        switch (request.getDecision()) {
            case APPROVED -> newStatus = SubmissionStatus.APPROVED;
            case REJECTED -> newStatus = SubmissionStatus.REJECTED;
            case CHANGES_REQUESTED -> newStatus = SubmissionStatus.CHANGES_REQUESTED;
            default -> throw new BadRequestException("Invalid decision type");
        }

        // Update version and submission
        version.setStatus(newStatus);
        versionRepository.save(version);

        submission.setOverallStatus(newStatus);
        submissionRepository.save(submission);

        // Record Decision
        ApprovalDecision decision = ApprovalDecision.builder()
                .submission(submission)
                .version(version)
                .reviewer(reviewer)
                .decision(request.getDecision())
                .comments(request.getComments())
                .build();
        decision = decisionRepository.save(decision);

        auditService.logAction(submission.getOrganization(), reviewer, "APPROVAL_DECISION",
                "APPROVAL_DECISION", decision.getId(),
                "Reviewer " + reviewer.getFullName() + " marked Version " + version.getVersionNumber() + " as " + request.getDecision());

        return ApprovalDecisionDto.builder()
                .id(decision.getId())
                .submissionId(submission.getId())
                .submissionTitle(submission.getTitle())
                .versionId(version.getId())
                .versionNumber(version.getVersionNumber())
                .reviewerId(reviewer.getId())
                .reviewerName(reviewer.getFullName())
                .decision(decision.getDecision())
                .comments(decision.getComments())
                .decidedAt(decision.getDecidedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApprovalDecisionDto> getSubmissionApprovalHistory(Long submissionId) {
        return decisionRepository.findBySubmissionIdOrderByDecidedAtDesc(submissionId).stream()
                .map(d -> ApprovalDecisionDto.builder()
                        .id(d.getId())
                        .submissionId(d.getSubmission().getId())
                        .submissionTitle(d.getSubmission().getTitle())
                        .versionId(d.getVersion().getId())
                        .versionNumber(d.getVersion().getVersionNumber())
                        .reviewerId(d.getReviewer().getId())
                        .reviewerName(d.getReviewer().getFullName())
                        .decision(d.getDecision())
                        .comments(d.getComments())
                        .decidedAt(d.getDecidedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private SubmissionResponseDto mapToSubmissionDto(ContentSubmission sub, ContentVersion version) {
        return SubmissionResponseDto.builder()
                .id(sub.getId())
                .organizationId(sub.getOrganization().getId())
                .organizationName(sub.getOrganization().getName())
                .creatorId(sub.getCreator().getId())
                .creatorName(sub.getCreator().getFullName())
                .title(sub.getTitle())
                .campaignName(sub.getCampaignName())
                .contentType(sub.getContentType())
                .marketingChannel(sub.getMarketingChannel())
                .description(sub.getDescription())
                .overallStatus(sub.getOverallStatus())
                .currentVersionId(sub.getCurrentVersionId())
                .currentVersionNumber(version != null ? version.getVersionNumber() : 1)
                .currentContentText(version != null ? version.getContentText() : "")
                .publicationDate(sub.getPublicationDate())
                .latestRiskScore(version != null ? version.getRiskScore() : 0)
                .latestRiskLevel(version != null ? version.getRiskLevel() : Severity.LOW)
                .createdAt(sub.getCreatedAt())
                .updatedAt(sub.getUpdatedAt())
                .build();
    }
}
