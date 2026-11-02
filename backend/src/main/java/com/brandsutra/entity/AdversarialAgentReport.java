package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adversarial_agent_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdversarialAgentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_id", nullable = false)
    private AdversarialSimulation simulation;

    @Column(name = "agent_perspective", nullable = false)
    private String agentPerspective; // CONSUMER, COMPLIANCE, REPUTATION

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 0;

    @Column(name = "perspective_summary", columnDefinition = "TEXT")
    private String perspectiveSummary;

    @Column(name = "findings_json", columnDefinition = "LONGTEXT")
    private String findingsJson;

    @Column(name = "recommendations_json", columnDefinition = "LONGTEXT")
    private String recommendationsJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

