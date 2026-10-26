package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "brand_facts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandFact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BrandFactCategory category;

    @Column(name = "fact_title", nullable = false)
    private String factTitle;

    @Column(name = "approved_statement", nullable = false, columnDefinition = "TEXT")
    private String approvedStatement;

    private String source;

    @Builder.Default
    private String version = "v1.0";

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Builder.Default
    private String status = "APPROVED";

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
