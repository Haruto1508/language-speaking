package com.linguatalk.dto;

import com.linguatalk.domain.VocabularyStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class ReviewDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewItemDto {
        private Long progressId;
        private Long vocabularyId;
        private String word;
        private String meaning;
        private String partOfSpeech;
        private String pronunciationIpa;
        private String exampleSentence;
        private String translation;
        private String hangul;
        private String romanization;
        private VocabularyStatus status;
        private Integer repetitions;
        private Integer correctCount;
        private Integer incorrectCount;
        private LocalDateTime nextReviewAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewSubmission {
        @NotNull(message = "Vocabulary ID is required")
        private Long vocabularyId;

        @NotNull(message = "Rating is required (1: Again, 2: Hard, 3: Good, 4: Easy)")
        @Min(1)
        @Max(4)
        private Integer rating; // 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
    }
}
