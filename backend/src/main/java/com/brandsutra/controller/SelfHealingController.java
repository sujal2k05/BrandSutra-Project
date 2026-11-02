package com.brandsutra.controller;

import com.brandsutra.dto.selfhealing.SelfHealingRequest;
import com.brandsutra.dto.selfhealing.SelfHealingSessionDto;
import com.brandsutra.entity.User;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.UserPrincipal;
import com.brandsutra.service.SelfHealingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/self-healing")
@RequiredArgsConstructor
public class SelfHealingController {

    private final SelfHealingService selfHealingService;
    private final UserRepository userRepository;

    @PostMapping("/heal")
    public ResponseEntity<SelfHealingSessionDto> startSelfHealing(
            @Valid @RequestBody SelfHealingRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(selfHealingService.startSession(request, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SelfHealingSessionDto> getSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(selfHealingService.getSession(id, user));
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<List<SelfHealingSessionDto>> getSessionsBySubmission(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(selfHealingService.getSessionsBySubmission(submissionId, user));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<SelfHealingSessionDto> acceptSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(selfHealingService.acceptSession(id, user));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<SelfHealingSessionDto> rejectSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(selfHealingService.rejectSession(id, user));
    }
}

