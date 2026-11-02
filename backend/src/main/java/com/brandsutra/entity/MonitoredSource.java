package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monitored_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoredSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    @Builder.Default
    private SourceType sourceType = SourceType.PUBLIC_URL;

    @Column(length = 1024)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_frequency", nullable = false)
    @Builder.Default
    private CheckFrequency checkFrequency = CheckFrequency.HOURLY;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_checked_at")
    private LocalDateTime lastCheckedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_status")
    @Builder.Default
    private MonitoringStatus lastStatus = MonitoringStatus.PENDING;

    @Column(name = "current_hash", length = 64)
    private String currentHash;

    @Column(name = "current_snapshot", columnDefinition = "LONGTEXT")
    private String currentSnapshot;

    @Column(name = "baseline_snapshot", columnDefinition = "LONGTEXT")
    private String baselineSnapshot;

    @Column(name = "last_risk_score")
    @Builder.Default
    private Integer lastRiskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_drift_type")
    @Builder.Default
    private DriftType lastDriftType = DriftType.NO_CHANGE;

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

