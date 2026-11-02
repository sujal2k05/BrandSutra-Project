package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adversarial_simulations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdversarialSimulation {

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
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "content_text", nullable = false, columnDefinition = "LONGTEXT")
    private String contentText;

    @Column(name = "campaign_name")
    private String campaignName;

    @Column(name = "overall_risk_score")
    @Builder.Default
    private Integer overallRiskScore = 0;

    @Column(name = "consumer_risk_score")
    @Builder.Default
    private Integer consumerRiskScore = 0;

    @Column(name = "compliance_risk_score")
    @Builder.Default
    private Integer complianceRiskScore = 0;

    @Column(name = "reputation_risk_score")
    @Builder.Default
    private Integer reputationRiskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    @Builder.Default
    private Severity riskLevel = Severity.LOW;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

