package com.brandsutra.dto.brand;

import com.brandsutra.entity.RuleType;
import com.brandsutra.entity.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandRuleDto {
    private Long id;
    private Long organizationId;
    @NotNull(message = "Rule type is required")
    private RuleType ruleType;
    @NotBlank(message = "Term or phrase is required")
    private String termOrPhrase;
    private String preferredReplacement;
    private String explanation;
    private Double thresholdValue;
    @Builder.Default
    private Severity severity = Severity.HIGH;
    @Builder.Default
    private Boolean isActive = true;
}
