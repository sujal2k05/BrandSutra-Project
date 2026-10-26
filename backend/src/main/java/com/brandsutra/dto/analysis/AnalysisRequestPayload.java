package com.brandsutra.dto.analysis;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequestPayload {
    @JsonProperty("submission_id")
    private Long submissionId;

    @JsonProperty("version_id")
    private Long versionId;

    @JsonProperty("organization_id")
    private Long organizationId;

    @JsonProperty("submitted_text")
    private String submittedText;

    @JsonProperty("content_type")
    private String contentType;

    @JsonProperty("marketing_channel")
    private String marketingChannel;

    @JsonProperty("brand_profile")
    private BrandProfilePayload brandProfile;

    @JsonProperty("approved_facts")
    private List<FactPayload> approvedFacts;

    @JsonProperty("brand_rules")
    private List<RulePayload> brandRules;

    @JsonProperty("guidelines_text")
    private String guidelinesText;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandProfilePayload {
        @JsonProperty("brand_name")
        private String brandName;
        @JsonProperty("voice_tone")
        private String voiceTone;
        @JsonProperty("mission")
        private String mission;
        @JsonProperty("tone_guidelines")
        private String toneGuidelines;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactPayload {
        private Long id;
        private String category;
        @JsonProperty("fact_title")
        private String factTitle;
        @JsonProperty("approved_statement")
        private String approvedStatement;
        private String source;
        private String version;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RulePayload {
        private Long id;
        @JsonProperty("rule_type")
        private String ruleType;
        @JsonProperty("term_or_phrase")
        private String termOrPhrase;
        @JsonProperty("preferred_replacement")
        private String preferredReplacement;
        private String explanation;
        @JsonProperty("threshold_value")
        private Double thresholdValue;
        private String severity;
    }
}
