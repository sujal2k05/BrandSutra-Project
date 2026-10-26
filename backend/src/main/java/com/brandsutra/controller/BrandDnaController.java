package com.brandsutra.controller;

import com.brandsutra.dto.brand.BrandFactDto;
import com.brandsutra.dto.brand.BrandGuidelineDto;
import com.brandsutra.dto.brand.BrandProfileDto;
import com.brandsutra.dto.brand.BrandRuleDto;
import com.brandsutra.entity.User;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.UserPrincipal;
import com.brandsutra.service.BrandDnaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandDnaController {

    private final BrandDnaService brandDnaService;
    private final UserRepository userRepository;

    // --- Brand DNA Profile ---

    @GetMapping("/{orgId}/dna")
    public ResponseEntity<BrandProfileDto> getBrandDna(@PathVariable Long orgId) {
        return ResponseEntity.ok(brandDnaService.getBrandProfile(orgId));
    }

    @PutMapping("/{orgId}/dna")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandProfileDto> updateBrandDna(
            @PathVariable Long orgId,
            @Valid @RequestBody BrandProfileDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(brandDnaService.updateBrandProfile(orgId, dto, user));
    }

    // --- Brand Facts ---

    @GetMapping("/{orgId}/facts")
    public ResponseEntity<List<BrandFactDto>> getBrandFacts(@PathVariable Long orgId) {
        return ResponseEntity.ok(brandDnaService.getBrandFacts(orgId));
    }

    @PostMapping("/{orgId}/facts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandFactDto> addBrandFact(
            @PathVariable Long orgId,
            @Valid @RequestBody BrandFactDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(brandDnaService.addBrandFact(orgId, dto, user));
    }

    @PutMapping("/facts/{factId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandFactDto> updateBrandFact(
            @PathVariable Long factId,
            @Valid @RequestBody BrandFactDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(brandDnaService.updateBrandFact(factId, dto, user));
    }

    @DeleteMapping("/facts/{factId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrandFact(
            @PathVariable Long factId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        brandDnaService.deleteBrandFact(factId, user);
        return ResponseEntity.noContent().build();
    }

    // --- Brand Rules & Terminology ---

    @GetMapping("/{orgId}/rules")
    public ResponseEntity<List<BrandRuleDto>> getBrandRules(@PathVariable Long orgId) {
        return ResponseEntity.ok(brandDnaService.getBrandRules(orgId));
    }

    @PostMapping("/{orgId}/rules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandRuleDto> addBrandRule(
            @PathVariable Long orgId,
            @Valid @RequestBody BrandRuleDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(brandDnaService.addBrandRule(orgId, dto, user));
    }

    @DeleteMapping("/rules/{ruleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrandRule(
            @PathVariable Long ruleId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        brandDnaService.deleteBrandRule(ruleId, user);
        return ResponseEntity.noContent().build();
    }

    // --- Brand Guidelines & PDF Upload ---

    @GetMapping("/{orgId}/guidelines")
    public ResponseEntity<List<BrandGuidelineDto>> getBrandGuidelines(@PathVariable Long orgId) {
        return ResponseEntity.ok(brandDnaService.getBrandGuidelines(orgId));
    }

    @PostMapping("/{orgId}/guidelines")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandGuidelineDto> addGuideline(
            @PathVariable Long orgId,
            @Valid @RequestBody BrandGuidelineDto dto,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(brandDnaService.addGuideline(orgId, dto, user));
    }

    @PostMapping("/{orgId}/guidelines/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandGuidelineDto> uploadPdfGuideline(
            @PathVariable Long orgId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(brandDnaService.uploadPdfGuideline(orgId, title, file, user));
    }
}
