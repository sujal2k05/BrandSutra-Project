package com.brandsutra.controller;

import com.brandsutra.dto.analysis.AnalysisResponseDto;
import com.brandsutra.dto.content.ContentVersionDto;
import com.brandsutra.dto.content.CreateRevisionRequest;
import com.brandsutra.dto.content.CreateSubmissionRequest;
import com.brandsutra.dto.content.SubmissionResponseDto;
import com.brandsutra.entity.User;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.UserPrincipal;
import com.brandsutra.service.AnalysisService;
import com.brandsutra.service.ContentSubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentSubmissionController {

    private final ContentSubmissionService contentSubmissionService;
    private final AnalysisService analysisService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<SubmissionResponseDto> createSubmission(
            @Valid @RequestBody CreateSubmissionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User creator = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(contentSubmissionService.createSubmission(request, creator));
    }

    @GetMapping
    public ResponseEntity<List<SubmissionResponseDto>> getSubmissions(
            @RequestParam(value = "orgId", required = false) Long orgId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (orgId != null) {
            return ResponseEntity.ok(contentSubmissionService.getOrganizationSubmissions(orgId));
        }
        return ResponseEntity.ok(contentSubmissionService.getUserSubmissions(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponseDto> getSubmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(contentSubmissionService.getSubmissionById(id));
    }

    @PostMapping("/{id}/revisions")
    public ResponseEntity<ContentVersionDto> createRevision(
            @PathVariable Long id,
            @Valid @RequestBody CreateRevisionRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User creator = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(contentSubmissionService.createRevision(id, request, creator));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<ContentVersionDto>> getSubmissionVersions(@PathVariable Long id) {
        return ResponseEntity.ok(contentSubmissionService.getSubmissionVersions(id));
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<AnalysisResponseDto> analyzeSubmission(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(analysisService.analyzeSubmission(id, user));
    }

    @GetMapping("/{id}/findings")
    public ResponseEntity<AnalysisResponseDto> getLatestFindings(@PathVariable Long id) {
        return ResponseEntity.ok(analysisService.getLatestAnalysisForSubmission(id));
    }

    @GetMapping("/versions/{versionId}/findings")
    public ResponseEntity<AnalysisResponseDto> getVersionFindings(@PathVariable Long versionId) {
        return ResponseEntity.ok(analysisService.getAnalysisForVersion(versionId));
    }

    @PostMapping("/findings/{findingId}/dismiss")
    public ResponseEntity<Void> dismissFinding(
            @PathVariable Long findingId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        analysisService.dismissFinding(findingId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/analyze-visual")
    public ResponseEntity<Object> analyzeVisual(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "marketingChannel", defaultValue = "INSTAGRAM") String marketingChannel,
            @RequestParam(value = "primaryColorHex", defaultValue = "#6366F1") String primaryColorHex,
            @RequestParam(value = "secondaryColorHex", defaultValue = "#8B5CF6") String secondaryColorHex,
            @org.springframework.beans.factory.annotation.Autowired com.brandsutra.client.AiServiceClient aiServiceClient
    ) {
        return ResponseEntity.ok(aiServiceClient.analyzeVisualAsset(file, marketingChannel, primaryColorHex, secondaryColorHex));
    }
}
