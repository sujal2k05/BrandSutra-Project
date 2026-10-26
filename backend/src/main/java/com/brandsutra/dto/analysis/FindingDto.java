package com.brandsutra.dto.analysis;

import com.brandsutra.entity.EvidenceStatus;
import com.brandsutra.entity.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FindingDto {
    private Long id;
    private String category;
    private String issue;
    private Severity severity;
    private EvidenceStatus evidenceStatus;
    private String explanation;
    private String excerpt;
    private Long evidenceId;
    private String evidenceText;
    private String sourceName;
    private String sourceVersion;
    private String suggestedCorrection;
    private Double confidence;
    private Boolean isDismissed;
}
