package com.linguatalk.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationScenarioDto {
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
