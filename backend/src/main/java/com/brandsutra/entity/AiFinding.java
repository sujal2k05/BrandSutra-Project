package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_findings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AnalysisResult analysis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id", nullable = false)
    private ContentVersion version;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String issue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_status", nullable = false)
    private EvidenceStatus evidenceStatus;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_id")
    private BrandFact evidence;

    @Column(name = "evidence_text", columnDefinition = "TEXT")
    private String evidenceText;

    @Column(name = "source_name")
    private String sourceName;

    @Column(name = "source_version")
    private String sourceVersion;

    @Column(name = "suggested_correction", columnDefinition = "TEXT")
    private String suggestedCorrection;

    @Builder.Default
    private Double confidence = 0.95;

    @Column(name = "is_dismissed")
    @Builder.Default
    private Boolean isDismissed = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
