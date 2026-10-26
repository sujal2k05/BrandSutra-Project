package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id", nullable = false)
    private ContentVersion version;

    @Column(name = "total_findings")
    @Builder.Default
    private Integer totalFindings = 0;

    @Column(name = "low_count")
    @Builder.Default
    private Integer lowCount = 0;

    @Column(name = "medium_count")
    @Builder.Default
    private Integer mediumCount = 0;

    @Column(name = "high_count")
    @Builder.Default
    private Integer highCount = 0;

    @Column(name = "critical_count")
    @Builder.Default
    private Integer criticalCount = 0;

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    @Builder.Default
    private Severity riskLevel = Severity.LOW;

    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "analysis_summary", columnDefinition = "TEXT")
    private String analysisSummary;

    @Column(name = "execution_time_ms")
    @Builder.Default
    private Long executionTimeMs = 0L;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
