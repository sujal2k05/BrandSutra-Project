package com.brandsutra.dto.brand;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandProfileDto {
    private Long id;
    private Long organizationId;
    private String brandName;
    private String mission;
    private String valuesStatement;
    private String targetAudience;
    private String voiceTone;
    private String toneGuidelines;
}
