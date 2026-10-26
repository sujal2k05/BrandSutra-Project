package com.brandsutra.service;

import com.brandsutra.dto.content.ContentVersionDto;
import com.brandsutra.dto.content.CreateRevisionRequest;
import com.brandsutra.dto.content.CreateSubmissionRequest;
import com.brandsutra.dto.content.SubmissionResponseDto;
import com.brandsutra.entity.*;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.repository.ContentSubmissionRepository;
import com.brandsutra.repository.ContentVersionRepository;
import com.brandsutra.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentSubmissionService {

    private final ContentSubmissionRepository submissionRepository;
    private final ContentVersionRepository versionRepository;
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    @Transactional
    public SubmissionResponseDto createSubmission(CreateSubmissionRequest request, User creator) {
        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + request.getOrganizationId()));

        // 1. Create Submission
        ContentSubmission submission = ContentSubmission.builder()
                .organization(org)
                .creator(creator)
                .title(request.getTitle())
                .campaignName(request.getCampaignName())
                .contentType(request.getContentType())
                .marketingChannel(request.getMarketingChannel())
                .description(request.getDescription())
                .overallStatus(SubmissionStatus.DRAFT)
                .publicationDate(request.getPublicationDate())
                .build();
        submission = submissionRepository.save(submission);

        // 2. Create Initial Version (Version 1)
        ContentVersion version = ContentVersion.builder()
                .submission(submission)
                .versionNumber(1)
                .contentText(request.getContentText())
                .createdBy(creator)
                .status(SubmissionStatus.DRAFT)
                .riskScore(0)
                .riskLevel(Severity.LOW)
                .build();
        version = versionRepository.save(version);

        // 3. Link current version
        submission.setCurrentVersionId(version.getId());
        submission = submissionRepository.save(submission);

        auditService.logAction(org, creator, "SUBMISSION_CREATED", "CONTENT_SUBMISSION", submission.getId(),
                "Created submission: '" + submission.getTitle() + "' (Version 1)");

        return mapToSubmissionDto(submission, version);
    }

    @Transactional
    public ContentVersionDto createRevision(Long submissionId, CreateRevisionRequest request, User creator) {
        ContentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + submissionId));

        Integer maxVersion = versionRepository.findMaxVersionNumberBySubmissionId(submissionId);
        int nextVersionNumber = (maxVersion != null ? maxVersion : 1) + 1;

        ContentVersion newVersion = ContentVersion.builder()
                .submission(submission)
                .versionNumber(nextVersionNumber)
                .contentText(request.getContentText())
                .createdBy(creator)
                .status(SubmissionStatus.DRAFT)
                .riskScore(0)
                .riskLevel(Severity.LOW)
                .build();
        newVersion = versionRepository.save(newVersion);

        submission.setCurrentVersionId(newVersion.getId());
        submission.setOverallStatus(SubmissionStatus.DRAFT);
        submissionRepository.save(submission);

        auditService.logAction(submission.getOrganization(), creator, "REVISION_CREATED", "CONTENT_VERSION", newVersion.getId(),
                "Created revision Version " + nextVersionNumber + " for submission: '" + submission.getTitle() + "'");

        return mapToVersionDto(newVersion);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponseDto> getOrganizationSubmissions(Long orgId) {
        List<ContentSubmission> submissions = submissionRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        return submissions.stream().map(sub -> {
            ContentVersion currentVersion = sub.getCurrentVersionId() != null
                    ? versionRepository.findById(sub.getCurrentVersionId()).orElse(null)
                    : null;
            return mapToSubmissionDto(sub, currentVersion);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponseDto> getUserSubmissions(Long userId) {
        List<ContentSubmission> submissions = submissionRepository.findByCreatorIdOrderByCreatedAtDesc(userId);
        return submissions.stream().map(sub -> {
            ContentVersion currentVersion = sub.getCurrentVersionId() != null
                    ? versionRepository.findById(sub.getCurrentVersionId()).orElse(null)
                    : null;
            return mapToSubmissionDto(sub, currentVersion);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionResponseDto getSubmissionById(Long id) {
        ContentSubmission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));
        ContentVersion currentVersion = sub.getCurrentVersionId() != null
                ? versionRepository.findById(sub.getCurrentVersionId()).orElse(null)
                : null;
        return mapToSubmissionDto(sub, currentVersion);
    }

    @Transactional(readOnly = true)
    public List<ContentVersionDto> getSubmissionVersions(Long submissionId) {
        List<ContentVersion> versions = versionRepository.findBySubmissionIdOrderByVersionNumberDesc(submissionId);
        return versions.stream().map(this::mapToVersionDto).collect(Collectors.toList());
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

    private ContentVersionDto mapToVersionDto(ContentVersion v) {
        return ContentVersionDto.builder()
                .id(v.getId())
                .submissionId(v.getSubmission().getId())
                .versionNumber(v.getVersionNumber())
                .contentText(v.getContentText())
                .createdById(v.getCreatedBy().getId())
                .createdByName(v.getCreatedBy().getFullName())
                .status(v.getStatus())
                .riskScore(v.getRiskScore())
                .riskLevel(v.getRiskLevel())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
