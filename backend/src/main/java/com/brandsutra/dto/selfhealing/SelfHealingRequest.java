package com.brandsutra.dto.selfhealing;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelfHealingRequest {
    @JsonProperty("submission_id")
    private Long submissionId;

    @JsonProperty("version_id")
    private Long versionId;

    @JsonProperty("organization_id")
    private Long organizationId;

    @NotBlank(message = "Content text is required")
    @JsonProperty("content_text")
    private String contentText;

    @JsonProperty("max_iterations")
    @Builder.Default
    private Integer maxIterations = 3;
}

