package com.linguatalk.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DialogueDto {
    private Long id;
    private Long lessonId;
    private String title;
    private String contextDescription;
    private String userRole;
    private String partnerRole;
    private List<DialogueLineDto> lines;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DialogueLineDto {
        private Long id;
        private String speakerName;
        private String speakerRole;
        private String textOriginal;
        private String textRomanized;
        private String textTranslation;
        private String audioUrl;
        private Integer orderIndex;
    }
}
