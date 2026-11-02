package com.brandsutra.dto.selfhealing;

import com.brandsutra.entity.HealingSessionStatus;
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
public class SelfHealingSessionDto {
    private Long id;
    @JsonProperty("organization_id")
    private Long organizationId;
    @JsonProperty("submission_id")
    private Long submissionId;
    @JsonProperty("source_version_id")
    private Long sourceVersionId;
    @JsonProperty("created_by_id")
    private Long createdById;
    @JsonProperty("created_by_name")
    private String createdByName;
    @JsonProperty("original_text")
    private String originalText;
    @JsonProperty("healed_text")
    private String healedText;
    @JsonProperty("iterations_count")
    private Integer iterationsCount;
    private HealingSessionStatus status;
    @JsonProperty("initial_risk_score")
    private Integer initialRiskScore;
    @JsonProperty("final_risk_score")
    private Integer finalRiskScore;
    @JsonProperty("final_risk_level")
    private Severity finalRiskLevel;
    @JsonProperty("resolved_violations_count")
    private Integer resolvedViolationsCount;
    @JsonProperty("remaining_violations_count")
    private Integer remainingViolationsCount;
    private String summary;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    private List<AgentStepDto> steps;
    @JsonProperty("diff_highlights")
    private String diffHighlights;
}

