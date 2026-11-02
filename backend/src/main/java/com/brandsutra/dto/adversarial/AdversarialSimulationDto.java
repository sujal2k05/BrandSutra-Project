package com.brandsutra.dto.adversarial;

import com.brandsutra.entity.Severity;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdversarialSimulationDto {
    private Long id;
    @JsonProperty("organization_id")
    private Long organizationId;
    @JsonProperty("submission_id")
    private Long submissionId;
    @JsonProperty("created_by_id")
    private Long createdById;
    @JsonProperty("created_by_name")
    private String createdByName;
    @JsonProperty("content_text")
    private String contentText;
    @JsonProperty("campaign_name")
    private String campaignName;
    @JsonProperty("overall_risk_score")
    private Integer overallRiskScore;
    @JsonProperty("consumer_risk_score")
    private Integer consumerRiskScore;
    @JsonProperty("compliance_risk_score")
    private Integer complianceRiskScore;
    @JsonProperty("reputation_risk_score")
    private Integer reputationRiskScore;
    @JsonProperty("risk_level")
    private Severity riskLevel;
    @JsonProperty("executive_summary")
    private String executiveSummary;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    private List<AdversarialReportDto> reports;
}

