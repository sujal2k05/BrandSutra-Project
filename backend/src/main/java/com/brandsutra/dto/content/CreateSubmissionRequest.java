package com.brandsutra.dto.content;

import com.brandsutra.entity.ContentType;
import com.brandsutra.entity.MarketingChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubmissionRequest {
    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotBlank(message = "Title is required")
    private String title;

    private String campaignName;

    @NotNull(message = "Content type is required")
    private ContentType contentType;

    @NotNull(message = "Marketing channel is required")
    private MarketingChannel marketingChannel;

    private String description;

    @NotBlank(message = "Marketing content text is required")
    private String contentText;

    private LocalDate publicationDate;
}
