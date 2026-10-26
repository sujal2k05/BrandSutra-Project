package com.brandsutra.dto.analysis;

import com.brandsutra.entity.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponseDto {
    private Long id;
    private Long versionId;
    private Integer totalFindings;
    private Integer lowCount;
    private Integer mediumCount;
    private Integer highCount;
    private Integer criticalCount;
    private Integer riskScore;
    private Severity riskLevel;
    private String status;
    private String analysisSummary;
    private Long executionTimeMs;
    private List<FindingDto> findings;
}
