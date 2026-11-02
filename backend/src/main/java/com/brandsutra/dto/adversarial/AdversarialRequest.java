package com.brandsutra.dto.adversarial;

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
public class AdversarialRequest {
    @JsonProperty("submission_id")
    private Long submissionId;

    @JsonProperty("organization_id")
    private Long organizationId;

    @NotBlank(message = "Content text is required")
    @JsonProperty("content_text")
    private String contentText;

    @JsonProperty("campaign_name")
    private String campaignName;
}

