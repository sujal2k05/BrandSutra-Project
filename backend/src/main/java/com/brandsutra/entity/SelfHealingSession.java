package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "self_healing_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelfHealingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private ContentSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_version_id")
    private ContentVersion sourceVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "original_text", nullable = false, columnDefinition = "LONGTEXT")
    private String originalText;

    @Column(name = "healed_text", columnDefinition = "LONGTEXT")
    private String healedText;

    @Column(name = "iterations_count")
    @Builder.Default
    private Integer iterationsCount = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private HealingSessionStatus status = HealingSessionStatus.COMPLETED;

    @Column(name = "initial_risk_score")
    @Builder.Default
    private Integer initialRiskScore = 0;

    @Column(name = "final_risk_score")
    @Builder.Default
    private Integer finalRiskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "final_risk_level")
    @Builder.Default
    private Severity finalRiskLevel = Severity.LOW;

    @Column(name = "resolved_violations_count")
    @Builder.Default
    private Integer resolvedViolationsCount = 0;

    @Column(name = "remaining_violations_count")
    @Builder.Default
    private Integer remainingViolationsCount = 0;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

