package com.brandsutra.dto.content;

import com.brandsutra.entity.Severity;
import com.brandsutra.entity.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentVersionDto {
    private Long id;
    private Long submissionId;
    private Integer versionNumber;
    private String contentText;
    private Long createdById;
    private String createdByName;
    private SubmissionStatus status;
    private Integer riskScore;
    private Severity riskLevel;
    private LocalDateTime createdAt;
}
