package com.brandsutra.dto.drift;

import com.brandsutra.entity.DriftType;
import com.brandsutra.entity.Severity;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriftAlertDto {
    private Long id;
    @JsonProperty("organization_id")
    private Long organizationId;
    @JsonProperty("source_id")
    private Long sourceId;
    @JsonProperty("source_name")
    private String sourceName;
    @JsonProperty("alert_title")
    private String alertTitle;
    @JsonProperty("drift_type")
    private DriftType driftType;
    private Severity severity;
    @JsonProperty("risk_score")
    private Integer riskScore;
    private String explanation;
    @JsonProperty("is_reviewed")
    private Boolean isReviewed;
    @JsonProperty("reviewed_by_name")
    private String reviewedByName;
    @JsonProperty("reviewed_at")
    private LocalDateTime reviewedAt;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}

