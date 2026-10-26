package com.brandsutra.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalSubmissions;
    private long approvedCount;
    private long pendingReviewsCount;
    private long rejectedCount;
    private long highRiskCount;
    private double averageRiskScore;
}
