package com.linguatalk.dto;

import com.linguatalk.domain.VocabularyStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyDto {
    private Long id;
    private Long lessonId;
    private String word;
    private String meaning;
    private String partOfSpeech;
    private String pronunciationIpa;
    private String exampleSentence;
    private String translation;
    private String difficulty;
    private String relatedWords;
    private String collocations;

    // Korean specific
    private String hangul;
    private String romanization;
    private String batchimRules;
    private String soundChanges;
    private String breakdownJson;

    // User-specific progress
    private VocabularyStatus userStatus;
    private Integer correctCount;
    private Integer incorrectCount;
}
