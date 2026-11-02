package com.brandsutra.controller;

import com.brandsutra.dto.adversarial.AdversarialRequest;
import com.brandsutra.dto.adversarial.AdversarialSimulationDto;
import com.brandsutra.entity.User;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.UserPrincipal;
import com.brandsutra.service.AdversarialSimulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adversarial")
@RequiredArgsConstructor
public class AdversarialController {

    private final AdversarialSimulationService simulationService;
    private final UserRepository userRepository;

    @PostMapping("/simulate")
    public ResponseEntity<AdversarialSimulationDto> simulate(
            @Valid @RequestBody AdversarialRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(simulationService.runSimulation(request, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdversarialSimulationDto> getSimulation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(simulationService.getSimulation(id, user));
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<List<AdversarialSimulationDto>> getSimulationsBySubmission(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(simulationService.getSimulationsBySubmission(submissionId, user));
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        byte[] pdfBytes = simulationService.exportPdf(id, user);

        if (pdfBytes == null || pdfBytes.length == 0) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"message\": \"PDF generation produced 0 bytes.\"}".getBytes());
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"brandsutra-adversarial-audit-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

