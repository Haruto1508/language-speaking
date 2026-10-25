package com.linguatalk.dto;

import com.linguatalk.domain.ExerciseType;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseDto {
    private Long id;
    private Long lessonId;
    private String title;
    private ExerciseType type;
    private List<ExerciseQuestionDto> questions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExerciseQuestionDto {
        private Long id;
        private String prompt;
        private String audioUrl;
        private String optionsJson;
        private String correctAnswer;
        private String explanation;
        private Integer orderIndex;
    }
}
