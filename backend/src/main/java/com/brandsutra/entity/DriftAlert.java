package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drift_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriftAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id", nullable = false)
    private MonitoredSource source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "history_id")
    private DriftCheckHistory history;

    @Column(name = "alert_title", nullable = false)
    private String alertTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "drift_type", nullable = false)
    private DriftType driftType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Severity severity = Severity.HIGH;

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 0;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "is_reviewed", nullable = false)
    @Builder.Default
    private Boolean isReviewed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

