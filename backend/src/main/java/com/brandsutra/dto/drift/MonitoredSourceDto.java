package com.brandsutra.dto.drift;

import com.brandsutra.entity.CheckFrequency;
import com.brandsutra.entity.DriftType;
import com.brandsutra.entity.MonitoringStatus;
import com.brandsutra.entity.SourceType;
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
public class MonitoredSourceDto {
    private Long id;
    @JsonProperty("organization_id")
    private Long organizationId;
    @JsonProperty("created_by_id")
    private Long createdById;
    @JsonProperty("created_by_name")
    private String createdByName;
    private String name;
    @JsonProperty("source_type")
    private SourceType sourceType;
    private String url;
    @JsonProperty("check_frequency")
    private CheckFrequency checkFrequency;
    @JsonProperty("is_active")
    private Boolean isActive;
    @JsonProperty("last_checked_at")
    private LocalDateTime lastCheckedAt;
    @JsonProperty("last_status")
    private MonitoringStatus lastStatus;
    @JsonProperty("current_hash")
    private String currentHash;
    @JsonProperty("current_snapshot")
    private String currentSnapshot;
    @JsonProperty("baseline_snapshot")
    private String baselineSnapshot;
    @JsonProperty("last_risk_score")
    private Integer lastRiskScore;
    @JsonProperty("last_drift_type")
    private DriftType lastDriftType;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}

