package com.linguatalk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ConversationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScenarioDto {
        private Long id;
        private Long lessonId;
        private String topicCode;
        private String languageCode;
        private String levelCode;
        private String title;
        private String description;
        private String userRole;
        private String aiRole;
        private String initialGreeting;
        private String culturalContext;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StartRequest {
        @NotNull(message = "Scenario ID is required")
        private Long scenarioId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReplyRequest {
        @NotNull(message = "Session ID is required")
        private Long sessionId;

        @NotBlank(message = "User message content cannot be blank")
        private String message;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageDto {
        private Long id;
        private String senderRole;
        private String content;
        private LocalDateTime timestamp;
        private String grammarFeedback;
        private String suggestedAlternative;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SessionDto {
        private Long id;
        private ScenarioDto scenario;
        private String status;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
        private Integer overallScore;
        private Integer fluencyScore;
        private Integer grammarScore;
        private Integer vocabularyScore;
        private String feedbackSummary;
        private String naturalExpressionsJson;
        private String mistakesJson;
        private List<MessageDto> messages;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FeedbackDto {
        private Long sessionId;
        private Integer overallScore;
        private Integer fluencyScore;
        private Integer grammarScore;
        private Integer vocabularyScore;
        private String feedbackSummary;
        private List<String> grammarMistakes;
        private List<String> vocabularyMistakes;
        private List<String> moreNaturalExpressions;
        private List<String> usefulVocabulary;
        private List<String> suggestedAlternativeSentences;
    }
}
