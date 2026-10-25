package com.linguatalk.dto;

import com.linguatalk.domain.ContentStatus;
import com.linguatalk.domain.ProficiencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class AdminDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateLessonRequest {
        @NotNull(message = "Topic ID is required")
        private Long topicId;

        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Scenario is required")
        private String scenario;

        @NotNull(message = "Proficiency level is required")
        private ProficiencyLevel difficulty;

        private String learningObjectives;
        private String targetGrammarFocus;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateLessonStatusRequest {
        @NotNull(message = "Status is required")
        private ContentStatus status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IngestContentRequest {
        @NotBlank(message = "Language code is required (EN/KO)")
        private String languageCode;

        @NotBlank(message = "Level code is required")
        private String levelCode;

        @NotBlank(message = "Topic title is required")
        private String topicTitle;

        @NotBlank(message = "Raw source text or syllabus is required")
        private String rawSourceText;
    }
}
