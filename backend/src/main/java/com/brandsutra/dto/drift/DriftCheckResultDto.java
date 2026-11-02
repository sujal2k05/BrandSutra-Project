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
public class DriftCheckResultDto {
    @JsonProperty("source_id")
    private Long sourceId;
    @JsonProperty("source_name")
    private String sourceName;
    @JsonProperty("checked_at")
    private LocalDateTime checkedAt;
    @JsonProperty("previous_hash")
    private String previousHash;
    @JsonProperty("new_hash")
    private String newHash;
    @JsonProperty("has_drift")
    private Boolean hasDrift;
    @JsonProperty("drift_type")
    private DriftType driftType;
    @JsonProperty("risk_score")
    private Integer riskScore;
    @JsonProperty("risk_level")
    private Severity riskLevel;
    @JsonProperty("findings_count")
    private Integer findingsCount;
    private String details;
    @JsonProperty("snapshot_excerpt")
    private String snapshotExcerpt;
}

