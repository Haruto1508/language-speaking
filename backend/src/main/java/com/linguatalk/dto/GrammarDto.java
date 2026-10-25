package com.linguatalk.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarDto {
    private Long id;
    private Long lessonId;
    private String grammarPoint;
    private String explanation;
    private String usageGuide;
    private String structureFormula;
    private String commonMistakes;
    private String formalityLevel;
    private String koreanPattern;
    private String exampleConversationsJson;
}
