package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "brand_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false, unique = true)
    private Organization organization;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(columnDefinition = "TEXT")
    private String mission;

    @Column(name = "values_statement", columnDefinition = "TEXT")
    private String valuesStatement;

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "voice_tone")
    @Builder.Default
    private String voiceTone = "Professional";

    @Column(name = "tone_guidelines", columnDefinition = "TEXT")
    private String toneGuidelines;

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
