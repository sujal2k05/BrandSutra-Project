package com.brandsutra.dto.brand;

import com.brandsutra.entity.BrandFactCategory;
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
public class BrandFactDto {
    private Long id;
    private Long organizationId;
    @NotNull(message = "Category is required")
    private BrandFactCategory category;
    @NotBlank(message = "Fact title is required")
    private String factTitle;
    @NotBlank(message = "Approved statement is required")
    private String approvedStatement;
    private String source;
    private String version;
    private LocalDate effectiveDate;
    private LocalDate expirationDate;
    private String status;
}
