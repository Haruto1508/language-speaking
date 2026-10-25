package com.linguatalk.dto;

import com.linguatalk.domain.ContentStatus;
import com.linguatalk.domain.ProficiencyLevel;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonSummaryDto {
    private Long id;
    private Long topicId;
    private String topicName;
    private String title;
    private String scenario;
    private String description;
    private ProficiencyLevel difficulty;
    private ContentStatus status;
    private Integer orderIndex;
    private Boolean completed;
    private Integer score;
    private Integer vocabularyCount;
    private Integer grammarCount;
    private Integer exercisesCount;
}
