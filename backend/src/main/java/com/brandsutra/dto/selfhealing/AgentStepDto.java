package com.brandsutra.dto.selfhealing;

import com.brandsutra.entity.AgentStepName;
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
public class AgentStepDto {
    private Long id;
    @JsonProperty("session_id")
    private Long sessionId;
    @JsonProperty("iteration_number")
    private Integer iterationNumber;
    @JsonProperty("agent_name")
    private AgentStepName agentName;
    private String status;
    @JsonProperty("input_snippet")
    private String inputSnippet;
    @JsonProperty("output_text")
    private String outputText;
    @JsonProperty("findings_json")
    private String findingsJson;
    private String explanation;
    @JsonProperty("execution_time_ms")
    private Long executionTimeMs;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
