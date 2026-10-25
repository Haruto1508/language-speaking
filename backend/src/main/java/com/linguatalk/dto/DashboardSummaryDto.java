package com.linguatalk.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private Integer streakCount;
    private Integer dailyGoalMinutes;
    private Integer minutesStudiedToday;
    private Long vocabularyLearnedCount;
    private Long vocabularyMasteredCount;
    private Long lessonsCompletedCount;
    private Long grammarPointsCount;
    private Integer conversationsCompletedCount;
    private Integer dueReviewsCount;
    private LessonSummaryDto recommendedLesson;
    private List<MistakeDto> recentMistakes;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MistakeDto {
        private Long id;
        private String type;
        private String originalText;
        private String correctedText;
        private String explanation;
        private Boolean reviewed;
        private LocalDateTime createdAt;
    }
}
