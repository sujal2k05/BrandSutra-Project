package com.brandsutra.dto.adversarial;

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
public class AdversarialReportDto {
    private Long id;
    @JsonProperty("simulation_id")
    private Long simulationId;
    @JsonProperty("agent_perspective")
    private String agentPerspective; // CONSUMER, COMPLIANCE, REPUTATION
    @JsonProperty("risk_score")
    private Integer riskScore;
    @JsonProperty("perspective_summary")
    private String perspectiveSummary;
    @JsonProperty("findings_json")
    private String findingsJson;
    @JsonProperty("recommendations_json")
    private String recommendationsJson;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
