package com.brandsutra.dto.approval;

import com.brandsutra.entity.DecisionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
    @NotNull(message = "Decision is required")
    private DecisionType decision;
    private String comments;
}
