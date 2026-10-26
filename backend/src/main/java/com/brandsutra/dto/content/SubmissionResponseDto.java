package com.brandsutra.dto.content;

import com.brandsutra.entity.ContentType;
import com.brandsutra.entity.MarketingChannel;
import com.brandsutra.entity.Severity;
import com.brandsutra.entity.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponseDto {
    private Long id;
    private Long organizationId;
    private String organizationName;
    private Long creatorId;
    private String creatorName;
    private String title;
    private String campaignName;
    private ContentType contentType;
    private MarketingChannel marketingChannel;
    private String description;
    private SubmissionStatus overallStatus;
    private Long currentVersionId;
    private Integer currentVersionNumber;
    private String currentContentText;
    private LocalDate publicationDate;
    private Integer latestRiskScore;
    private Severity latestRiskLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
