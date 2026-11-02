package com.brandsutra.dto.drift;

import com.brandsutra.entity.CheckFrequency;
import com.brandsutra.entity.SourceType;
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
public class RegisterSourceDto {
    @JsonProperty("organization_id")
    private Long organizationId;

    @NotBlank(message = "Source name is required")
    private String name;

    @JsonProperty("source_type")
    @Builder.Default
    private SourceType sourceType = SourceType.PUBLIC_URL;

    private String url;

    @JsonProperty("initial_content")
    private String initialContent;

    @JsonProperty("check_frequency")
    @Builder.Default
    private CheckFrequency checkFrequency = CheckFrequency.HOURLY;
}

