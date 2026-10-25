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
public class LessonDetailDto {
    private Long id;
    private Long topicId;
    private String topicName;
    private String languageCode;
    private String title;
    private String scenario;
    private String description;
    private ProficiencyLevel difficulty;
    private ContentStatus status;
    private String learningObjectives;
    private String culturalNotes;
    private String formalityExplanation;
    private Integer orderIndex;
    private Boolean completed;
    private Integer score;

    private List<VocabularyDto> vocabulary;
    private List<GrammarDto> grammar;
    private List<DialogueDto> dialogues;
    private List<ExerciseDto> exercises;
    private List<ConversationScenarioDto> scenarios;
}
