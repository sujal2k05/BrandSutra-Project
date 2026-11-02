package com.brandsutra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "self_healing_agent_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelfHealingAgentStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private SelfHealingSession session;

    @Column(name = "iteration_number", nullable = false)
    private Integer iterationNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "agent_name", nullable = false)
    private AgentStepName agentName;

    @Column(nullable = false)
    @Builder.Default
    private String status = "SUCCESS";

    @Column(name = "input_snippet", columnDefinition = "TEXT")
    private String inputSnippet;

    @Column(name = "output_text", columnDefinition = "LONGTEXT")
    private String outputText;

    @Column(name = "findings_json", columnDefinition = "LONGTEXT")
    private String findingsJson;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "execution_time_ms")
    @Builder.Default
    private Long executionTimeMs = 0L;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

