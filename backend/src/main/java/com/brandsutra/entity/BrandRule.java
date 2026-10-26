package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "brand_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;

    @Column(name = "term_or_phrase", nullable = false)
    private String termOrPhrase;

    @Column(name = "preferred_replacement")
    private String preferredReplacement;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "threshold_value")
    private Double thresholdValue;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Severity severity = Severity.HIGH;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
