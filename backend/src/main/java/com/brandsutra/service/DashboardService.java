package com.brandsutra.service;

import com.brandsutra.dto.approval.ApprovalDecisionDto;
import com.brandsutra.dto.content.SubmissionResponseDto;
import com.brandsutra.dto.dashboard.AnalyticsDataDto;
import com.brandsutra.dto.dashboard.DashboardSummaryDto;
import com.brandsutra.entity.ContentSubmission;
import com.brandsutra.entity.ContentVersion;
import com.brandsutra.entity.SubmissionStatus;
import com.brandsutra.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ContentSubmissionRepository submissionRepository;
    private final ContentVersionRepository versionRepository;
    private final AiFindingRepository aiFindingRepository;
    private final ApprovalDecisionRepository approvalDecisionRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary(Long orgId) {
        long total = submissionRepository.countByOrganizationId(orgId);
        long approved = submissionRepository.countByOrganizationIdAndOverallStatus(orgId, SubmissionStatus.APPROVED);
        long pending = submissionRepository.countByOrganizationIdAndOverallStatus(orgId, SubmissionStatus.PENDING_REVIEW);
        long rejected = submissionRepository.countByOrganizationIdAndOverallStatus(orgId, SubmissionStatus.REJECTED);
        long highRisk = versionRepository.countHighRiskVersionsByOrganizationId(orgId);
        Double avgRisk = versionRepository.findAverageRiskScoreByOrganizationId(orgId);

        return DashboardSummaryDto.builder()
                .totalSubmissions(total)
                .approvedCount(approved)
                .pendingReviewsCount(pending)
                .rejectedCount(rejected)
                .highRiskCount(highRisk)
                .averageRiskScore(avgRisk != null ? Math.round(avgRisk * 10.0) / 10.0 : 0.0)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsDataDto getAnalytics(Long orgId) {
        DashboardSummaryDto summary = getSummary(orgId);

        // Status Distribution
        Map<String, Long> statusMap = new HashMap<>();
        for (SubmissionStatus st : SubmissionStatus.values()) {
            long count = submissionRepository.countByOrganizationIdAndOverallStatus(orgId, st);
            if (count > 0) {
                statusMap.put(st.name(), count);
            }
        }

        // Category Distribution
        Map<String, Long> categoryMap = new HashMap<>();
        List<Object[]> catResults = aiFindingRepository.countFindingsByCategoryForOrg(orgId);
        for (Object[] row : catResults) {
            String cat = (String) row[0];
            Long cnt = (Long) row[1];
            categoryMap.put(cat, cnt);
        }

        // Severity Distribution
        Map<String, Long> severityMap = new HashMap<>();
        List<Object[]> sevResults = aiFindingRepository.countFindingsBySeverityForOrg(orgId);
        for (Object[] row : sevResults) {
            String sev = row[0].toString();
            Long cnt = (Long) row[1];
            severityMap.put(sev, cnt);
        }

        // Recent Submissions (Top 5)
        List<ContentSubmission> recentSubs = submissionRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        List<SubmissionResponseDto> recentSubDtos = recentSubs.stream().limit(6).map(sub -> {
            ContentVersion currentVersion = sub.getCurrentVersionId() != null
                    ? versionRepository.findById(sub.getCurrentVersionId()).orElse(null)
                    : null;
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
                    .overallStatus(sub.getOverallStatus())
                    .currentVersionId(sub.getCurrentVersionId())
                    .currentVersionNumber(currentVersion != null ? currentVersion.getVersionNumber() : 1)
                    .latestRiskScore(currentVersion != null ? currentVersion.getRiskScore() : 0)
                    .latestRiskLevel(currentVersion != null ? currentVersion.getRiskLevel() : null)
                    .createdAt(sub.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        // Recent Reviews (Top 5)
        List<ApprovalDecisionDto> recentReviews = approvalDecisionRepository.findTop10BySubmissionOrganizationIdOrderByDecidedAtDesc(orgId)
                .stream().map(d -> ApprovalDecisionDto.builder()
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
                        .build()).collect(Collectors.toList());

        return AnalyticsDataDto.builder()
                .summary(summary)
                .statusDistribution(statusMap)
                .categoryDistribution(categoryMap)
                .severityDistribution(severityMap)
                .recentSubmissions(recentSubDtos)
                .recentReviews(recentReviews)
                .build();
    }
}
