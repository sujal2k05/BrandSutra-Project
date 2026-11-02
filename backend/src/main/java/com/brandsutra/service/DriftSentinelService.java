package com.brandsutra.service;

import com.brandsutra.client.AiServiceClient;
import com.brandsutra.dto.analysis.AnalysisRequestPayload;
import com.brandsutra.dto.drift.*;
import com.brandsutra.entity.*;
import com.brandsutra.exception.BadRequestException;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.exception.UnauthorizedException;
import com.brandsutra.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriftSentinelService {

    private final MonitoredSourceRepository sourceRepository;
    private final DriftCheckHistoryRepository historyRepository;
    private final DriftAlertRepository alertRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final BrandFactRepository brandFactRepository;
    private final BrandRuleRepository brandRuleRepository;
    private final BrandGuidelineRepository brandGuidelineRepository;
    private final OrganizationMemberRepository memberRepository;
    private final AuditService auditService;
    private final UrlFetchService urlFetchService;
    private final AiServiceClient aiServiceClient;

    public static String computeNormalizedHash(String content) {
        if (content == null) content = "";
        // Stable normalization: collapse any consecutive whitespace/newlines to a single space and trim
        String normalized = content.trim().replaceAll("\\s+", " ");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return Integer.toHexString(normalized.hashCode());
        }
    }

    @Transactional
    public MonitoredSourceDto registerSource(RegisterSourceDto dto, User user) {
        log.info("Registering monitored asset source: '{}'", dto.getName());

        Organization org = null;
        if (dto.getOrganizationId() != null) {
            verifyOrgAccess(dto.getOrganizationId(), user);
            org = memberRepository.findByUserId(user.getId()).stream()
                    .map(OrganizationMember::getOrganization)
                    .filter(o -> o.getId().equals(dto.getOrganizationId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        } else {
            List<OrganizationMember> members = memberRepository.findByUserId(user.getId());
            if (members.isEmpty()) {
                throw new BadRequestException("User does not belong to any organization");
            }
            org = members.get(0).getOrganization();
        }

        SourceType st = dto.getSourceType() != null ? dto.getSourceType() : SourceType.PUBLIC_URL;
        String initialContent = dto.getInitialContent();

        if (st == SourceType.PUBLIC_URL) {
            if (dto.getUrl() == null || dto.getUrl().isBlank()) {
                throw new BadRequestException("URL is required for PUBLIC_URL source type");
            }
            // SSRF Validation upfront
            urlFetchService.validateUrlSafety(dto.getUrl());

            // If initial content is not provided, fetch baseline snapshot immediately
            if (initialContent == null || initialContent.isBlank()) {
                try {
                    initialContent = urlFetchService.fetchPublicUrlContent(dto.getUrl());
                } catch (Exception e) {
                    log.warn("Could not fetch initial content for URL {}: {}", dto.getUrl(), e.getMessage());
                    initialContent = "Pending initial fetch";
                }
            }
        } else {
            if (initialContent == null || initialContent.isBlank()) {
                throw new BadRequestException("Initial baseline content is required for MANUAL_SNAPSHOT");
            }
        }

        String initialHash = computeNormalizedHash(initialContent);

        MonitoredSource source = MonitoredSource.builder()
                .organization(org)
                .createdBy(user)
                .name(dto.getName())
                .sourceType(st)
                .url(dto.getUrl())
                .checkFrequency(dto.getCheckFrequency() != null ? dto.getCheckFrequency() : CheckFrequency.HOURLY)
                .isActive(true)
                .lastCheckedAt(LocalDateTime.now())
                .lastStatus(MonitoringStatus.HEALTHY)
                .baselineSnapshot(initialContent)
                .currentSnapshot(initialContent)
                .currentHash(initialHash)
                .lastRiskScore(0)
                .lastDriftType(DriftType.NO_CHANGE)
                .build();

        source = sourceRepository.save(source);

        // Record initial check history
        DriftCheckHistory history = DriftCheckHistory.builder()
                .source(source)
                .hasDrift(false)
                .driftType(DriftType.NO_CHANGE)
                .riskScore(0)
                .riskLevel(Severity.LOW)
                .findingsCount(0)
                .previousHash(initialHash)
                .newHash(initialHash)
                .details("Initial baseline registered successfully.")
                .snapshotExcerpt(initialContent.length() > 500 ? initialContent.substring(0, 500) : initialContent)
                .build();
        historyRepository.save(history);

        auditService.logAction(org, user, "SOURCE_MONITORING_REGISTERED", "MONITORED_SOURCE", source.getId(),
                "Registered source '" + source.getName() + "' for continuous drift governance.");

        return mapSourceToDto(source);
    }

    @Transactional
    public DriftCheckResultDto checkSourceNow(Long sourceId, User user) {
        MonitoredSource source = sourceRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Monitored source not found: " + sourceId));

        if (user != null) {
            verifyOrgAccess(source.getOrganization().getId(), user);
        }

        return executeSourceCheck(source, user);
    }

    @Transactional
    public DriftCheckResultDto executeSourceCheck(MonitoredSource source, User triggerUser) {
        long startTime = System.currentTimeMillis();
        String fetchedContent = "";
        MonitoringStatus checkStatus = MonitoringStatus.HEALTHY;
        String errorMessage = null;

        try {
            if (source.getSourceType() == SourceType.PUBLIC_URL) {
                fetchedContent = urlFetchService.fetchPublicUrlContent(source.getUrl());
            } else {
                fetchedContent = source.getCurrentSnapshot() != null ? source.getCurrentSnapshot() : "";
            }
        } catch (Exception e) {
            log.error("Failed to fetch monitored source '{}': {}", source.getName(), e.getMessage());
            checkStatus = MonitoringStatus.ERROR;
            errorMessage = e.getMessage();
        }

        long fetchTime = System.currentTimeMillis() - startTime;
        String newHash = computeNormalizedHash(fetchedContent);
        String oldHash = source.getCurrentHash();
        boolean hashChanged = oldHash != null && !oldHash.equalsIgnoreCase(newHash);

        DriftType detectedType = DriftType.NO_CHANGE;
        int riskScore = 0;
        String details = "Snapshot identical to approved baseline.";

        if (checkStatus == MonitoringStatus.ERROR) {
            detectedType = DriftType.CRITICAL_DRIFT;
            details = "Failed to access asset: " + errorMessage;
            riskScore = 50;
        } else if (hashChanged || source.getBaselineSnapshot() == null) {
            // Content has drifted from previous hash! Dispatch to AI Drift Sentinel
            Long orgId = source.getOrganization().getId();
            BrandProfile profile = brandProfileRepository.findByOrganizationId(orgId).orElse(null);
            List<BrandFact> approvedFacts = brandFactRepository.findByOrganizationIdAndStatus(orgId, "APPROVED");
            List<BrandRule> activeRules = brandRuleRepository.findByOrganizationIdAndIsActiveTrue(orgId);
            List<BrandGuideline> guidelines = brandGuidelineRepository.findByOrganizationId(orgId);

            StringBuilder guidelinesText = new StringBuilder();
            for (BrandGuideline g : guidelines) {
                guidelinesText.append("=== ").append(g.getTitle()).append(" ===\n")
                        .append(g.getContentText()).append("\n\n");
            }

            AiServiceClient.DriftValidationRequest valReq = new AiServiceClient.DriftValidationRequest();
            valReq.setSourceName(source.getName());
            valReq.setBaselineText(source.getBaselineSnapshot() != null ? source.getBaselineSnapshot() : "");
            valReq.setCurrentText(fetchedContent);
            valReq.setGuidelinesText(guidelinesText.toString());

            if (profile != null) {
                valReq.setBrandProfile(AnalysisRequestPayload.BrandProfilePayload.builder()
                        .brandName(profile.getBrandName())
                        .voiceTone(profile.getVoiceTone())
                        .mission(profile.getMission())
                        .build());
            }

            valReq.setApprovedFacts(approvedFacts.stream().map(f -> AnalysisRequestPayload.FactPayload.builder()
                    .id(f.getId())
                    .category(f.getCategory() != null ? f.getCategory().name() : "GENERAL")
                    .factTitle(f.getFactTitle())
                    .approvedStatement(f.getApprovedStatement())
                    .source(f.getSource())
                    .version(f.getVersion())
                    .build()).collect(Collectors.toList()));

            valReq.setBrandRules(activeRules.stream().map(r -> AnalysisRequestPayload.RulePayload.builder()
                    .id(r.getId())
                    .ruleType(r.getRuleType() != null ? r.getRuleType().name() : "BANNED_TERM")
                    .termOrPhrase(r.getTermOrPhrase())
                    .preferredReplacement(r.getPreferredReplacement())
                    .explanation(r.getExplanation())
                    .thresholdValue(r.getThresholdValue())
                    .severity(r.getSeverity() != null ? r.getSeverity().name() : "HIGH")
                    .build()).collect(Collectors.toList()));

            AiServiceClient.DriftValidationResponse valResp = aiServiceClient.validateDrift(valReq);

            try {
                if (valResp.getDriftType() != null) {
                    detectedType = DriftType.valueOf(valResp.getDriftType().toUpperCase());
                }
            } catch (Exception ignored) {
                detectedType = DriftType.BRAND_GUIDELINE_VIOLATION;
            }

            riskScore = valResp.getRiskScore() != null ? valResp.getRiskScore() : 0;
            details = valResp.getDetails() != null ? valResp.getDetails() : "Drift detected.";

            if (detectedType == DriftType.NO_CHANGE || detectedType == DriftType.FORMATTING_ONLY || detectedType == DriftType.CONTENT_CHANGE_COMPLIANT) {
                checkStatus = MonitoringStatus.HEALTHY;
            } else {
                checkStatus = MonitoringStatus.DRIFT_DETECTED;
            }
        }

        Severity checkSev = riskScore > 70 ? Severity.CRITICAL : riskScore > 40 ? Severity.HIGH : riskScore > 20 ? Severity.MEDIUM : Severity.LOW;

        // Update Source
        source.setLastCheckedAt(LocalDateTime.now());
        source.setLastStatus(checkStatus);
        source.setCurrentSnapshot(fetchedContent);
        source.setCurrentHash(newHash);
        source.setLastRiskScore(riskScore);
        source.setLastDriftType(detectedType);
        sourceRepository.save(source);

        // Record History
        DriftCheckHistory history = DriftCheckHistory.builder()
                .source(source)
                .hasDrift(checkStatus == MonitoringStatus.DRIFT_DETECTED)
                .driftType(detectedType)
                .riskScore(riskScore)
                .riskLevel(checkSev)
                .findingsCount(checkStatus == MonitoringStatus.DRIFT_DETECTED ? 1 : 0)
                .previousHash(oldHash)
                .newHash(newHash)
                .details(details)
                .snapshotExcerpt(fetchedContent.length() > 500 ? fetchedContent.substring(0, 500) : fetchedContent)
                .build();
        history = historyRepository.save(history);

        // Trigger In-App Alert if high-risk drift occurred
        if (checkStatus == MonitoringStatus.DRIFT_DETECTED && riskScore >= 20) {
            DriftAlert alert = DriftAlert.builder()
                    .organization(source.getOrganization())
                    .source(source)
                    .history(history)
                    .alertTitle("Drift Alert: " + detectedType.name().replace('_', ' ') + " on '" + source.getName() + "'")
                    .driftType(detectedType)
                    .severity(checkSev)
                    .riskScore(riskScore)
                    .explanation(details)
                    .isReviewed(false)
                    .build();
            alertRepository.save(alert);

            if (triggerUser != null) {
                auditService.logAction(source.getOrganization(), triggerUser, "DRIFT_ALERT_TRIGGERED", "DRIFT_ALERT", alert.getId(),
                        "Drift violation detected on '" + source.getName() + "' - " + detectedType.name());
            }
        }

        return DriftCheckResultDto.builder()
                .sourceId(source.getId())
                .sourceName(source.getName())
                .checkedAt(LocalDateTime.now())
                .previousHash(oldHash)
                .newHash(newHash)
                .hasDrift(checkStatus == MonitoringStatus.DRIFT_DETECTED)
                .driftType(detectedType)
                .riskScore(riskScore)
                .riskLevel(checkSev)
                .findingsCount(checkStatus == MonitoringStatus.DRIFT_DETECTED ? 1 : 0)
                .details(details)
                .snapshotExcerpt(fetchedContent.length() > 500 ? fetchedContent.substring(0, 500) : fetchedContent)
                .build();
    }

    @Transactional
    public MonitoredSourceDto updateManualSnapshot(Long sourceId, String content, User user) {
        MonitoredSource source = sourceRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Monitored source not found: " + sourceId));

        verifyOrgAccess(source.getOrganization().getId(), user);

        source.setCurrentSnapshot(content);
        source = sourceRepository.save(source);

        // Run check on new manual snapshot
        executeSourceCheck(source, user);

        return mapSourceToDto(source);
    }

    @Transactional
    public MonitoredSourceDto toggleSource(Long sourceId, boolean active, User user) {
        MonitoredSource source = sourceRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Monitored source not found: " + sourceId));

        verifyOrgAccess(source.getOrganization().getId(), user);

        source.setIsActive(active);
        source = sourceRepository.save(source);
        return mapSourceToDto(source);
    }

    @Transactional(readOnly = true)
    public List<MonitoredSourceDto> getSources(User user) {
        List<OrganizationMember> members = memberRepository.findByUserId(user.getId());
        if (members.isEmpty()) return new ArrayList<>();

        Long orgId = members.get(0).getOrganization().getId();
        return sourceRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId).stream()
                .map(this::mapSourceToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DriftAlertDto> getAlerts(User user) {
        List<OrganizationMember> members = memberRepository.findByUserId(user.getId());
        if (members.isEmpty()) return new ArrayList<>();

        Long orgId = members.get(0).getOrganization().getId();
        List<DriftAlert> alerts = alertRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        List<DriftAlertDto> dtos = new ArrayList<>();
        for (DriftAlert a : alerts) {
            dtos.add(DriftAlertDto.builder()
                    .id(a.getId())
                    .organizationId(orgId)
                    .sourceId(a.getSource().getId())
                    .sourceName(a.getSource().getName())
                    .alertTitle(a.getAlertTitle())
                    .driftType(a.getDriftType())
                    .severity(a.getSeverity())
                    .riskScore(a.getRiskScore())
                    .explanation(a.getExplanation())
                    .isReviewed(a.getIsReviewed())
                    .reviewedByName(a.getReviewedBy() != null ? a.getReviewedBy().getFullName() : null)
                    .reviewedAt(a.getReviewedAt())
                    .createdAt(a.getCreatedAt())
                    .build());
        }
        return dtos;
    }

    @Transactional
    public DriftAlertDto reviewAlert(Long alertId, User user) {
        DriftAlert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Drift alert not found: " + alertId));

        verifyOrgAccess(alert.getOrganization().getId(), user);

        alert.setIsReviewed(true);
        alert.setReviewedBy(user);
        alert.setReviewedAt(LocalDateTime.now());
        alert = alertRepository.save(alert);

        return DriftAlertDto.builder()
                .id(alert.getId())
                .organizationId(alert.getOrganization().getId())
                .sourceId(alert.getSource().getId())
                .sourceName(alert.getSource().getName())
                .alertTitle(alert.getAlertTitle())
                .driftType(alert.getDriftType())
                .severity(alert.getSeverity())
                .riskScore(alert.getRiskScore())
                .explanation(alert.getExplanation())
                .isReviewed(true)
                .reviewedByName(user.getFullName())
                .reviewedAt(alert.getReviewedAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }

    /**
     * Periodic Background Drift Poller. Runs every 60 seconds and verifies sources due for checking.
     */
    @Scheduled(fixedDelay = 60000)
    public void scheduledDriftPoll() {
        List<MonitoredSource> activeSources = sourceRepository.findByIsActiveTrue();
        if (activeSources.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        for (MonitoredSource src : activeSources) {
            try {
                boolean isDue = false;
                if (src.getLastCheckedAt() == null) {
                    isDue = true;
                } else {
                    long minutesSinceLastCheck = java.time.Duration.between(src.getLastCheckedAt(), now).toMinutes();
                    CheckFrequency freq = src.getCheckFrequency() != null ? src.getCheckFrequency() : CheckFrequency.HOURLY;
                    switch (freq) {
                        case HOURLY -> isDue = minutesSinceLastCheck >= 60;
                        case DAILY -> isDue = minutesSinceLastCheck >= 1440;
                        case MANUAL -> isDue = false;
                    }
                }

                if (isDue) {
                    log.info("Drift Sentinel Scheduled Poller checking source: {}", src.getName());
                    executeSourceCheck(src, null);
                }
            } catch (Exception e) {
                log.error("Scheduled drift poll error for source {}: {}", src.getId(), e.getMessage());
            }
        }
    }

    private void verifyOrgAccess(Long orgId, User user) {
        boolean isMember = memberRepository.findByUserId(user.getId()).stream()
                .anyMatch(m -> m.getOrganization().getId().equals(orgId));
        if (!isMember) {
            throw new UnauthorizedException("User does not have access to this organization");
        }
    }

    private MonitoredSourceDto mapSourceToDto(MonitoredSource s) {
        return MonitoredSourceDto.builder()
                .id(s.getId())
                .organizationId(s.getOrganization().getId())
                .createdById(s.getCreatedBy().getId())
                .createdByName(s.getCreatedBy().getFullName())
                .name(s.getName())
                .sourceType(s.getSourceType())
                .url(s.getUrl())
                .checkFrequency(s.getCheckFrequency())
                .isActive(s.getIsActive())
                .lastCheckedAt(s.getLastCheckedAt())
                .lastStatus(s.getLastStatus())
                .currentHash(s.getCurrentHash())
                .baselineSnapshot(s.getBaselineSnapshot())
                .currentSnapshot(s.getCurrentSnapshot())
                .lastRiskScore(s.getLastRiskScore())
                .lastDriftType(s.getLastDriftType())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
