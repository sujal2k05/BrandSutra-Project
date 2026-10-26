package com.brandsutra.dto.dashboard;

import com.brandsutra.dto.approval.ApprovalDecisionDto;
import com.brandsutra.dto.content.SubmissionResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDataDto {
    private DashboardSummaryDto summary;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> severityDistribution;
    private Map<String, Long> categoryDistribution;
    private List<SubmissionResponseDto> recentSubmissions;
    private List<ApprovalDecisionDto> recentReviews;
}
