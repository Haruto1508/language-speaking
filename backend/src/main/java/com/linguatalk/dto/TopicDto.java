package com.linguatalk.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicDto {
    private Long id;
    private String languageCode;
    private String levelCode;
    private String code;
    private String name;
    private String description;
    private String icon;
    private Integer estimatedMinutes;
    private Integer totalLessons;
    private Integer completedLessons;
    private Integer progressPercentage;
    private List<LessonSummaryDto> lessons;
}
