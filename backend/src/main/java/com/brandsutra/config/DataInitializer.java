package com.brandsutra.config;

import com.brandsutra.entity.*;
import com.brandsutra.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final BrandFactRepository brandFactRepository;
    private final BrandRuleRepository brandRuleRepository;
    private final BrandGuidelineRepository brandGuidelineRepository;
    private final ContentSubmissionRepository submissionRepository;
    private final ContentVersionRepository versionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains users. Skipping demo data initialization.");
            return;
        }

        log.info("Initializing demo organization: NovaHome Appliances...");

        // 1. Create Organization
        Organization org = Organization.builder()
                .name("NovaHome Appliances")
                .slug("novahome")
                .industry("Smart Home Appliances")
                .website("https://novahome.example.com")
                .description("Smart, energy-efficient modern appliances engineered for families.")
                .build();
        org = organizationRepository.save(org);

        // 2. Create Users
        User admin = User.builder()
                .email("admin@novahome.com")
                .fullName("Sujal Admin")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        admin = userRepository.save(admin);

        User creator = User.builder()
                .email("creator@novahome.com")
                .fullName("Sarah Creator")
                .passwordHash(passwordEncoder.encode("Creator@123"))
                .role(Role.CONTENT_CREATOR)
                .isActive(true)
                .build();
        creator = userRepository.save(creator);

        User reviewer = User.builder()
                .email("reviewer@novahome.com")
                .fullName("Marcus Reviewer")
                .passwordHash(passwordEncoder.encode("Reviewer@123"))
                .role(Role.REVIEWER)
                .isActive(true)
                .build();
        reviewer = userRepository.save(reviewer);

        // 3. Organization Memberships
        organizationMemberRepository.save(OrganizationMember.builder().organization(org).user(admin).roleInOrg(Role.ADMIN).build());
        organizationMemberRepository.save(OrganizationMember.builder().organization(org).user(creator).roleInOrg(Role.CONTENT_CREATOR).build());
        organizationMemberRepository.save(OrganizationMember.builder().organization(org).user(reviewer).roleInOrg(Role.REVIEWER).build());

        // 4. Brand DNA Profile
        BrandProfile profile = BrandProfile.builder()
                .organization(org)
                .brandName("NovaHome Appliances")
                .voiceTone("Professional and Friendly")
                .mission("Innovating everyday living through reliable, energy-efficient home appliances.")
                .valuesStatement("Reliability, Energy Efficiency, Customer First, Honest Pricing.")
                .targetAudience("Homeowners, families, and modern tech-savvy households.")
                .toneGuidelines("Avoid hyperbolic marketing. State actual warranties and verified energy ratings clearly.")
                .build();
        brandProfileRepository.save(profile);

        // 5. Approved Facts
        brandFactRepository.save(BrandFact.builder()
                .organization(org)
                .category(BrandFactCategory.WARRANTY)
                .factTitle("Standard Product Warranty")
                .approvedStatement("Standard warranty is 2 years on all appliances.")
                .source("Policy Handbook")
                .version("v1.0")
                .effectiveDate(LocalDate.of(2024, 1, 1))
                .status("APPROVED")
                .build());

        brandFactRepository.save(BrandFact.builder()
                .organization(org)
                .category(BrandFactCategory.WARRANTY)
                .factTitle("Model X Compressor Warranty")
                .approvedStatement("Model X compressor warranty is 5 years.")
                .source("Engineering Spec Sheet")
                .version("v2.1")
                .effectiveDate(LocalDate.of(2024, 1, 1))
                .status("APPROVED")
                .build());

        brandFactRepository.save(BrandFact.builder()
                .organization(org)
                .category(BrandFactCategory.DISCOUNTS)
                .factTitle("Maximum Seasonal Discount")
                .approvedStatement("Maximum seasonal discount is 25%.")
                .source("Q4 Pricing Policy")
                .version("v1.0")
                .effectiveDate(LocalDate.of(2024, 1, 1))
                .status("APPROVED")
                .build());

        brandFactRepository.save(BrandFact.builder()
                .organization(org)
                .category(BrandFactCategory.DISCOUNTS)
                .factTitle("Discount Product Scope")
                .approvedStatement("Discounts apply only to selected products, excluding new arrivals.")
                .source("Marketing Guidelines 2026")
                .version("v1.2")
                .effectiveDate(LocalDate.of(2024, 1, 1))
                .status("APPROVED")
                .build());

        brandFactRepository.save(BrandFact.builder()
                .organization(org)
                .category(BrandFactCategory.OFFERS)
                .factTitle("Seasonal Campaign Expiration")
                .approvedStatement("Seasonal offers expire on 30 November 2026.")
                .source("Annual Promotional Schedule")
                .version("v1.0")
                .effectiveDate(LocalDate.of(2026, 1, 1))
                .expirationDate(LocalDate.of(2026, 11, 30))
                .status("APPROVED")
                .build());

        brandFactRepository.save(BrandFact.builder()
                .organization(org)
                .category(BrandFactCategory.PRICING)
                .factTitle("Price Match Policy")
                .approvedStatement("Price matching is valid within 14 days of purchase from authorized retail partners.")
                .source("Retail Terms")
                .version("v1.1")
                .status("APPROVED")
                .build());

        brandFactRepository.save(BrandFact.builder()
                .organization(org)
                .category(BrandFactCategory.PERFORMANCE)
                .factTitle("Inverter Motor Efficiency")
                .approvedStatement("EcoDrive inverter motor reduces energy consumption by up to 35% compared to non-inverter models.")
                .source("Lab Report #441")
                .version("v1.0")
                .status("APPROVED")
                .build());

        // 6. Brand Rules (Terminology & Limits)
        brandRuleRepository.save(BrandRule.builder()
                .organization(org)
                .ruleType(RuleType.BANNED_TERM)
                .termOrPhrase("Guaranteed results")
                .preferredReplacement("Clinically tested / Verified performance")
                .explanation("Absolute promises violate consumer protection guidelines.")
                .severity(Severity.HIGH)
                .isActive(true)
                .build());

        brandRuleRepository.save(BrandRule.builder()
                .organization(org)
                .ruleType(RuleType.BANNED_TERM)
                .termOrPhrase("100% perfect")
                .preferredReplacement("Engineered for excellence")
                .explanation("Unsubstantiated perfection claims are deceptive.")
                .severity(Severity.CRITICAL)
                .isActive(true)
                .build());

        brandRuleRepository.save(BrandRule.builder()
                .organization(org)
                .ruleType(RuleType.BANNED_TERM)
                .termOrPhrase("Unlimited warranty")
                .preferredReplacement("Comprehensive warranty coverage")
                .explanation("False warranty promise contradicts the 2-year standard policy.")
                .severity(Severity.CRITICAL)
                .isActive(true)
                .build());

        brandRuleRepository.save(BrandRule.builder()
                .organization(org)
                .ruleType(RuleType.DISCOUNT_LIMIT)
                .termOrPhrase("Discount Threshold")
                .thresholdValue(25.0)
                .explanation("Advertising discounts greater than 25% violates company pricing rules.")
                .severity(Severity.CRITICAL)
                .isActive(true)
                .build());

        brandRuleRepository.save(BrandRule.builder()
                .organization(org)
                .ruleType(RuleType.WARRANTY_LIMIT)
                .termOrPhrase("Warranty Threshold")
                .thresholdValue(5.0)
                .explanation("Any warranty claim exceeding 5 years contradicts approved policy.")
                .severity(Severity.HIGH)
                .isActive(true)
                .build());

        // 7. Brand Guidelines
        brandGuidelineRepository.save(BrandGuideline.builder()
                .organization(org)
                .title("NovaHome Core Advertising Standards 2026")
                .contentText("""
NovaHome Advertising Guidelines & Legal Compliance
=================================================
1. Warranty Disclosures:
   - Always state that the 5-year warranty applies strictly to the Model X Compressor, not other components.
   - Standard coverage is 2 years for general appliances.
   
2. Pricing and Promotions:
   - Maximum promotional discount is strictly 25%.
   - Discounts apply solely to selected inventory and exclude newly released products.
   - Always mention the expiration date (30 November 2026) for seasonal offers.
   
3. Tone and Prohibited Language:
   - Never use superlative absolutes such as '100% perfect', 'flawless', or 'unlimited warranty'.
   - Present verifiable test data rather than exaggerated marketing claims.
""")
                .fileType("text/plain")
                .fileSize(840L)
                .isApproved(true)
                .version("v1.0")
                .build());

        // 8. Sample Content Submission
        ContentSubmission sampleSub = ContentSubmission.builder()
                .organization(org)
                .creator(creator)
                .title("Festive Mega Sale Announcement")
                .campaignName("Diwali & Festive Blast 2026")
                .contentType(ContentType.SOCIAL_MEDIA)
                .marketingChannel(MarketingChannel.INSTAGRAM)
                .description("Sample promotional draft testing automated brand compliance enforcement.")
                .overallStatus(SubmissionStatus.DRAFT)
                .publicationDate(LocalDate.of(2026, 11, 15))
                .build();
        sampleSub = submissionRepository.save(sampleSub);

        ContentVersion sampleVer = ContentVersion.builder()
                .submission(sampleSub)
                .versionNumber(1)
                .contentText("Get 40% OFF on all NovaHome products! Enjoy a 5-year warranty on everything. Our products are 100% perfect!")
                .createdBy(creator)
                .status(SubmissionStatus.DRAFT)
                .riskScore(0)
                .riskLevel(Severity.LOW)
                .build();
        sampleVer = versionRepository.save(sampleVer);

        sampleSub.setCurrentVersionId(sampleVer.getId());
        submissionRepository.save(sampleSub);

        log.info("Initialized NovaHome Appliances demo workspace with 3 users, 7 facts, 5 rules, and 1 sample submission.");
    }
}
