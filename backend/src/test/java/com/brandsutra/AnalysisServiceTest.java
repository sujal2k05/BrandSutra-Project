package com.brandsutra;

import com.brandsutra.client.AiServiceClient;
import com.brandsutra.dto.analysis.AnalysisRequestPayload;
import com.brandsutra.dto.analysis.AnalysisResponseDto;
import com.brandsutra.entity.*;
import com.brandsutra.repository.*;
import com.brandsutra.service.AnalysisService;
import com.brandsutra.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnalysisServiceTest {

    @Mock
    private ContentSubmissionRepository submissionRepository;
    @Mock
    private ContentVersionRepository versionRepository;
    @Mock
    private BrandProfileRepository brandProfileRepository;
    @Mock
    private BrandFactRepository brandFactRepository;
    @Mock
    private BrandRuleRepository brandRuleRepository;
    @Mock
    private BrandGuidelineRepository brandGuidelineRepository;
    @Mock
    private AnalysisResultRepository analysisResultRepository;
    @Mock
    private AiFindingRepository aiFindingRepository;
    @Mock
    private AiServiceClient aiServiceClient;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private AnalysisService analysisService;

    private Organization organization;
    private User creator;
    private ContentSubmission submission;
    private ContentVersion version;
    private BrandFact fact;

    @BeforeEach
    void setUp() {
        organization = Organization.builder().id(1L).name("NovaHome").slug("novahome").build();
        creator = User.builder().id(2L).email("creator@novahome.com").fullName("Creator").role(Role.CONTENT_CREATOR).build();
        submission = ContentSubmission.builder()
                .id(10L)
                .organization(organization)
                .creator(creator)
                .title("Test Post")
                .contentType(ContentType.SOCIAL_MEDIA)
                .marketingChannel(MarketingChannel.INSTAGRAM)
                .currentVersionId(100L)
                .build();
        version = ContentVersion.builder()
                .id(100L)
                .submission(submission)
                .versionNumber(1)
                .contentText("40% off on all items! 5 year warranty!")
                .createdBy(creator)
                .build();
        fact = BrandFact.builder()
                .id(50L)
                .organization(organization)
                .category(BrandFactCategory.DISCOUNTS)
                .factTitle("Max Discount")
                .approvedStatement("Maximum seasonal discount is 25%.")
                .source("Policy")
                .version("v1.0")
                .build();
    }

    @Test
    void testAnalyzeSubmission_ValidEvidenceIntegrityAndScoring() {
        when(submissionRepository.findById(10L)).thenReturn(Optional.of(submission));
        when(versionRepository.findById(100L)).thenReturn(Optional.of(version));
        when(brandFactRepository.findByOrganizationIdAndStatus(1L, "APPROVED")).thenReturn(List.of(fact));
        when(brandRuleRepository.findByOrganizationIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(brandGuidelineRepository.findByOrganizationIdAndIsApprovedTrue(1L)).thenReturn(Collections.emptyList());

        // Mock AI Service Response
        AiServiceClient.AiServiceAnalysisResponse mockAi = new AiServiceClient.AiServiceAnalysisResponse();
        AiServiceClient.FindingItem item1 = new AiServiceClient.FindingItem();
        item1.setCategory("DISCOUNTS");
        item1.setIssue("Discount exceeds policy");
        item1.setSeverity("CRITICAL");
        item1.setEvidenceStatus("CONTRADICTED");
        item1.setExplanation("Claimed 40% exceeds 25%");
        item1.setEvidenceId(50L); // Valid fact ID
        mockAi.setFindings(List.of(item1));
        mockAi.setSummary("Critical discount violation detected");

        when(aiServiceClient.analyzeContent(any(AnalysisRequestPayload.class))).thenReturn(mockAi);
        when(analysisResultRepository.save(any(AnalysisResult.class))).thenAnswer(i -> {
            AnalysisResult r = i.getArgument(0);
            r.setId(999L);
            return r;
        });

        AnalysisResponseDto result = analysisService.analyzeSubmission(10L, creator);

        assertNotNull(result);
        assertEquals(1, result.getTotalFindings());
        assertEquals(40, result.getRiskScore()); // 1 critical = 40
        assertEquals(Severity.MEDIUM, result.getRiskLevel()); // 40 is MEDIUM (0-20 LOW, 21-40 MED, 41-70 HIGH, 71-100 CRIT)
        assertEquals(50L, result.getFindings().get(0).getEvidenceId());
        assertEquals("Maximum seasonal discount is 25%.", result.getFindings().get(0).getEvidenceText());
    }

    @Test
    void testAnalyzeSubmission_InvalidEvidenceDemoted() {
        when(submissionRepository.findById(10L)).thenReturn(Optional.of(submission));
        when(versionRepository.findById(100L)).thenReturn(Optional.of(version));
        when(brandFactRepository.findByOrganizationIdAndStatus(1L, "APPROVED")).thenReturn(List.of(fact));

        // Mock AI Service Response citing non-existent evidenceId 999
        AiServiceClient.AiServiceAnalysisResponse mockAi = new AiServiceClient.AiServiceAnalysisResponse();
        AiServiceClient.FindingItem item1 = new AiServiceClient.FindingItem();
        item1.setCategory("PRICING");
        item1.setIssue("Claim unverified");
        item1.setSeverity("HIGH");
        item1.setEvidenceStatus("CONTRADICTED");
        item1.setEvidenceId(999L); // Invalid fact ID
        mockAi.setFindings(List.of(item1));

        when(aiServiceClient.analyzeContent(any(AnalysisRequestPayload.class))).thenReturn(mockAi);
        when(analysisResultRepository.save(any(AnalysisResult.class))).thenAnswer(i -> {
            AnalysisResult r = i.getArgument(0);
            r.setId(888L);
            return r;
        });

        AnalysisResponseDto result = analysisService.analyzeSubmission(10L, creator);

        assertNotNull(result);
        assertNull(result.getFindings().get(0).getEvidenceId());
        assertEquals(EvidenceStatus.REQUIRES_VERIFICATION, result.getFindings().get(0).getEvidenceStatus());
    }

    @Test
    void testAnalyzeSubmission_ReanalysisUpdatesExistingWithoutDuplicateKey() {
        when(submissionRepository.findById(10L)).thenReturn(Optional.of(submission));
        when(versionRepository.findById(100L)).thenReturn(Optional.of(version));
        when(brandFactRepository.findByOrganizationIdAndStatus(1L, "APPROVED")).thenReturn(List.of(fact));
        when(brandRuleRepository.findByOrganizationIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(brandGuidelineRepository.findByOrganizationIdAndIsApprovedTrue(1L)).thenReturn(Collections.emptyList());

        // Existing analysis result already present for version 100
        AnalysisResult existingResult = AnalysisResult.builder()
                .id(777L)
                .version(version)
                .totalFindings(5)
                .riskScore(80)
                .riskLevel(Severity.CRITICAL)
                .build();
        when(analysisResultRepository.findByVersionId(100L)).thenReturn(Optional.of(existingResult));

        // Existing findings to be replaced
        AiFinding oldFinding = AiFinding.builder().id(11L).analysis(existingResult).issue("Old issue").build();
        when(aiFindingRepository.findByAnalysisId(777L)).thenReturn(List.of(oldFinding));

        // Mock new AI response
        AiServiceClient.AiServiceAnalysisResponse mockAi = new AiServiceClient.AiServiceAnalysisResponse();
        AiServiceClient.FindingItem item1 = new AiServiceClient.FindingItem();
        item1.setCategory("DISCOUNTS");
        item1.setIssue("New discount violation");
        item1.setSeverity("LOW");
        item1.setEvidenceStatus("COMPLIANT");
        item1.setEvidenceId(50L);
        mockAi.setFindings(List.of(item1));
        mockAi.setSummary("Updated analysis");

        when(aiServiceClient.analyzeContent(any(AnalysisRequestPayload.class))).thenReturn(mockAi);
        when(analysisResultRepository.save(any(AnalysisResult.class))).thenAnswer(i -> i.getArgument(0));

        AnalysisResponseDto result = analysisService.analyzeSubmission(10L, creator);

        assertNotNull(result);
        assertEquals(777L, result.getId()); // Retains existing AnalysisResult ID
        assertEquals(1, result.getTotalFindings());
        assertEquals(5, result.getRiskScore());
        assertEquals(Severity.LOW, result.getRiskLevel());

        // Verify old findings were deleted and new analysis was updated in-place
        verify(aiFindingRepository).deleteAll(List.of(oldFinding));
        verify(analysisResultRepository).save(existingResult);
    }
}
