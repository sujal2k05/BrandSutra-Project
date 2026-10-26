package com.brandsutra.dto.approval;

import com.brandsutra.entity.DecisionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalDecisionDto {
    private Long id;
    private Long submissionId;
    private String submissionTitle;
    private Long versionId;
    private Integer versionNumber;
    private Long reviewerId;
    private String reviewerName;
    private DecisionType decision;
    private String comments;
    private LocalDateTime decidedAt;
}
