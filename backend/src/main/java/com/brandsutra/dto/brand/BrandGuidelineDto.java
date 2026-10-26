package com.brandsutra.dto.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandGuidelineDto {
    private Long id;
    private Long organizationId;
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Content text is required")
    private String contentText;
    private String originalFilename;
    private String fileType;
    private Long fileSize;
    @Builder.Default
    private Boolean isApproved = true;
    @Builder.Default
    private String version = "v1.0";
    private LocalDateTime createdAt;
}
