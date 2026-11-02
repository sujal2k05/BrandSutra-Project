package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drift_check_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriftCheckHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id", nullable = false)
    private MonitoredSource source;

    @Column(name = "checked_at", nullable = false)
    private LocalDateTime checkedAt;

    @Column(name = "previous_hash", length = 64)
    private String previousHash;

    @Column(name = "new_hash", length = 64)
    private String newHash;

    @Column(name = "has_drift", nullable = false)
    @Builder.Default
    private Boolean hasDrift = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "drift_type", nullable = false)
    @Builder.Default
    private DriftType driftType = DriftType.NO_CHANGE;

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    @Builder.Default
    private Severity riskLevel = Severity.LOW;

    @Column(name = "findings_count")
    @Builder.Default
    private Integer findingsCount = 0;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "snapshot_excerpt", columnDefinition = "TEXT")
    private String snapshotExcerpt;

    @PrePersist
    protected void onCreate() {
        if (this.checkedAt == null) {
            this.checkedAt = LocalDateTime.now();
        }
    }
}

