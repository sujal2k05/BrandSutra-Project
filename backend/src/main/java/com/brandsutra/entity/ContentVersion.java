package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ContentSubmission submission;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "content_text", nullable = false, columnDefinition = "LONGTEXT")
    private String contentText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.DRAFT;

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    @Builder.Default
    private Severity riskLevel = Severity.LOW;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
