package com.brandsutra.service;

import com.brandsutra.client.AiServiceClient;
import com.brandsutra.dto.brand.BrandFactDto;
import com.brandsutra.dto.brand.BrandGuidelineDto;
import com.brandsutra.dto.brand.BrandProfileDto;
import com.brandsutra.dto.brand.BrandRuleDto;
import com.brandsutra.entity.*;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandDnaService {

    private final BrandProfileRepository brandProfileRepository;
    private final BrandFactRepository brandFactRepository;
    private final BrandRuleRepository brandRuleRepository;
    private final BrandGuidelineRepository brandGuidelineRepository;
    private final OrganizationRepository organizationRepository;
    private final AiServiceClient aiServiceClient;
    private final AuditService auditService;

    // --- Brand Profile ---

    @Transactional(readOnly = true)
    public BrandProfileDto getBrandProfile(Long orgId) {
        BrandProfile profile = brandProfileRepository.findByOrganizationId(orgId)
                .orElseGet(() -> {
                    Organization org = organizationRepository.findById(orgId)
                            .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));
                    return BrandProfile.builder()
                            .organization(org)
                            .brandName(org.getName())
                            .voiceTone("Professional and Friendly")
                            .build();
                });
        return mapToProfileDto(profile);
    }

    @Transactional
    public BrandProfileDto updateBrandProfile(Long orgId, BrandProfileDto dto, User user) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        BrandProfile profile = brandProfileRepository.findByOrganizationId(orgId)
                .orElse(BrandProfile.builder().organization(org).build());

        profile.setBrandName(dto.getBrandName() != null ? dto.getBrandName() : org.getName());
        profile.setMission(dto.getMission());
        profile.setValuesStatement(dto.getValuesStatement());
        profile.setTargetAudience(dto.getTargetAudience());
        profile.setVoiceTone(dto.getVoiceTone() != null ? dto.getVoiceTone() : "Professional and Friendly");
        profile.setToneGuidelines(dto.getToneGuidelines());

        profile = brandProfileRepository.save(profile);
        auditService.logAction(org, user, "BRAND_PROFILE_UPDATED", "BRAND_PROFILE", profile.getId(),
                "Updated Brand DNA profile for " + profile.getBrandName());

        return mapToProfileDto(profile);
    }

    // --- Approved Facts ---

    @Transactional(readOnly = true)
    public List<BrandFactDto> getBrandFacts(Long orgId) {
        return brandFactRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToFactDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BrandFactDto addBrandFact(Long orgId, BrandFactDto dto, User user) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        BrandFact fact = BrandFact.builder()
                .organization(org)
                .category(dto.getCategory())
                .factTitle(dto.getFactTitle())
                .approvedStatement(dto.getApprovedStatement())
                .source(dto.getSource())
                .version(dto.getVersion() != null ? dto.getVersion() : "v1.0")
                .effectiveDate(dto.getEffectiveDate())
                .expirationDate(dto.getExpirationDate())
                .status("APPROVED")
                .build();

        fact = brandFactRepository.save(fact);
        auditService.logAction(org, user, "FACT_ADDED", "BRAND_FACT", fact.getId(),
                "Added approved fact: " + fact.getFactTitle() + " (" + fact.getCategory() + ")");

        return mapToFactDto(fact);
    }

    @Transactional
    public BrandFactDto updateBrandFact(Long factId, BrandFactDto dto, User user) {
        BrandFact fact = brandFactRepository.findById(factId)
                .orElseThrow(() -> new ResourceNotFoundException("Fact not found with ID: " + factId));

        fact.setCategory(dto.getCategory());
        fact.setFactTitle(dto.getFactTitle());
        fact.setApprovedStatement(dto.getApprovedStatement());
        fact.setSource(dto.getSource());
        fact.setVersion(dto.getVersion());
        fact.setEffectiveDate(dto.getEffectiveDate());
        fact.setExpirationDate(dto.getExpirationDate());
        if (dto.getStatus() != null) {
            fact.setStatus(dto.getStatus());
        }

        fact = brandFactRepository.save(fact);
        auditService.logAction(fact.getOrganization(), user, "FACT_UPDATED", "BRAND_FACT", fact.getId(),
                "Updated approved fact: " + fact.getFactTitle());

        return mapToFactDto(fact);
    }

    @Transactional
    public void deleteBrandFact(Long factId, User user) {
        BrandFact fact = brandFactRepository.findById(factId)
                .orElseThrow(() -> new ResourceNotFoundException("Fact not found: " + factId));
        auditService.logAction(fact.getOrganization(), user, "FACT_DELETED", "BRAND_FACT", fact.getId(),
                "Deleted fact: " + fact.getFactTitle());
        brandFactRepository.delete(fact);
    }

    // --- Brand Rules ---

    @Transactional(readOnly = true)
    public List<BrandRuleDto> getBrandRules(Long orgId) {
        return brandRuleRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToRuleDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BrandRuleDto addBrandRule(Long orgId, BrandRuleDto dto, User user) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        BrandRule rule = BrandRule.builder()
                .organization(org)
                .ruleType(dto.getRuleType())
                .termOrPhrase(dto.getTermOrPhrase())
                .preferredReplacement(dto.getPreferredReplacement())
                .explanation(dto.getExplanation())
                .thresholdValue(dto.getThresholdValue())
                .severity(dto.getSeverity() != null ? dto.getSeverity() : Severity.HIGH)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        rule = brandRuleRepository.save(rule);
        auditService.logAction(org, user, "RULE_ADDED", "BRAND_RULE", rule.getId(),
                "Added rule: " + rule.getRuleType() + " - " + rule.getTermOrPhrase());

        return mapToRuleDto(rule);
    }

    @Transactional
    public void deleteBrandRule(Long ruleId, User user) {
        BrandRule rule = brandRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));
        auditService.logAction(rule.getOrganization(), user, "RULE_DELETED", "BRAND_RULE", rule.getId(),
                "Deleted rule: " + rule.getTermOrPhrase());
        brandRuleRepository.delete(rule);
    }

    // --- Brand Guidelines & PDF Upload ---

    @Transactional(readOnly = true)
    public List<BrandGuidelineDto> getBrandGuidelines(Long orgId) {
        return brandGuidelineRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToGuidelineDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BrandGuidelineDto addGuideline(Long orgId, BrandGuidelineDto dto, User user) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        BrandGuideline guideline = BrandGuideline.builder()
                .organization(org)
                .title(dto.getTitle())
                .contentText(dto.getContentText())
                .originalFilename(dto.getOriginalFilename())
                .fileType(dto.getFileType() != null ? dto.getFileType() : "text/plain")
                .fileSize(dto.getFileSize() != null ? dto.getFileSize() : (long) dto.getContentText().length())
                .isApproved(dto.getIsApproved() != null ? dto.getIsApproved() : true)
                .version(dto.getVersion() != null ? dto.getVersion() : "v1.0")
                .build();

        guideline = brandGuidelineRepository.save(guideline);
        auditService.logAction(org, user, "GUIDELINE_ADDED", "BRAND_GUIDELINE", guideline.getId(),
                "Added guideline document: " + guideline.getTitle());

        return mapToGuidelineDto(guideline);
    }

    @Transactional
    public BrandGuidelineDto uploadPdfGuideline(Long orgId, String title, MultipartFile file, User user) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));

        // Call AI Service PyMuPDF extractor
        String extractedText = aiServiceClient.extractPdfText(file);

        BrandGuideline guideline = BrandGuideline.builder()
                .organization(org)
                .title(title != null && !title.isBlank() ? title : file.getOriginalFilename())
                .contentText(extractedText)
                .originalFilename(file.getOriginalFilename())
                .fileType("application/pdf")
                .fileSize(file.getSize())
                .isApproved(true)
                .version("v1.0")
                .build();

        guideline = brandGuidelineRepository.save(guideline);
        auditService.logAction(org, user, "PDF_GUIDELINE_EXTRACTED", "BRAND_GUIDELINE", guideline.getId(),
                "Uploaded and extracted PDF guideline: " + guideline.getTitle());

        return mapToGuidelineDto(guideline);
    }

    // --- Mappers ---

    private BrandProfileDto mapToProfileDto(BrandProfile p) {
        return BrandProfileDto.builder()
                .id(p.getId())
                .organizationId(p.getOrganization().getId())
                .brandName(p.getBrandName())
                .mission(p.getMission())
                .valuesStatement(p.getValuesStatement())
                .targetAudience(p.getTargetAudience())
                .voiceTone(p.getVoiceTone())
                .toneGuidelines(p.getToneGuidelines())
                .build();
    }

    private BrandFactDto mapToFactDto(BrandFact f) {
        return BrandFactDto.builder()
                .id(f.getId())
                .organizationId(f.getOrganization().getId())
                .category(f.getCategory())
                .factTitle(f.getFactTitle())
                .approvedStatement(f.getApprovedStatement())
                .source(f.getSource())
                .version(f.getVersion())
                .effectiveDate(f.getEffectiveDate())
                .expirationDate(f.getExpirationDate())
                .status(f.getStatus())
                .build();
    }

    private BrandRuleDto mapToRuleDto(BrandRule r) {
        return BrandRuleDto.builder()
                .id(r.getId())
                .organizationId(r.getOrganization().getId())
                .ruleType(r.getRuleType())
                .termOrPhrase(r.getTermOrPhrase())
                .preferredReplacement(r.getPreferredReplacement())
                .explanation(r.getExplanation())
                .thresholdValue(r.getThresholdValue())
                .severity(r.getSeverity())
                .isActive(r.getIsActive())
                .build();
    }

    private BrandGuidelineDto mapToGuidelineDto(BrandGuideline g) {
        return BrandGuidelineDto.builder()
                .id(g.getId())
                .organizationId(g.getOrganization().getId())
                .title(g.getTitle())
                .contentText(g.getContentText())
                .originalFilename(g.getOriginalFilename())
                .fileType(g.getFileType())
                .fileSize(g.getFileSize())
                .isApproved(g.getIsApproved())
                .version(g.getVersion())
                .createdAt(g.getCreatedAt())
                .build();
    }
}
