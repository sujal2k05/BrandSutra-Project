package com.brandsutra.controller;

import com.brandsutra.dto.drift.*;
import com.brandsutra.entity.User;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.UserPrincipal;
import com.brandsutra.service.DriftSentinelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drift")
@RequiredArgsConstructor
public class DriftSentinelController {

    private final DriftSentinelService driftSentinelService;
    private final UserRepository userRepository;

    @PostMapping("/sources")
    public ResponseEntity<MonitoredSourceDto> registerSource(
            @Valid @RequestBody RegisterSourceDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(driftSentinelService.registerSource(dto, user));
    }

    @GetMapping("/sources")
    public ResponseEntity<List<MonitoredSourceDto>> getSources(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(driftSentinelService.getSources(user));
    }

    @PostMapping("/sources/{id}/check-now")
    public ResponseEntity<DriftCheckResultDto> checkSourceNow(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(driftSentinelService.checkSourceNow(id, user));
    }

    @PutMapping("/sources/{id}/manual-snapshot")
    public ResponseEntity<MonitoredSourceDto> updateManualSnapshot(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        String content = payload != null ? payload.getOrDefault("content", "") : "";
        return ResponseEntity.ok(driftSentinelService.updateManualSnapshot(id, content, user));
    }

    @PutMapping("/sources/{id}/toggle")
    public ResponseEntity<MonitoredSourceDto> toggleSource(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        boolean active = payload != null && payload.getOrDefault("active", true);
        return ResponseEntity.ok(driftSentinelService.toggleSource(id, active, user));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<DriftAlertDto>> getAlerts(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(driftSentinelService.getAlerts(user));
    }

    @PostMapping("/alerts/{id}/review")
    public ResponseEntity<DriftAlertDto> reviewAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(driftSentinelService.reviewAlert(id, user));
    }
}

