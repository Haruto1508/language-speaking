package com.linguatalk.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grammar")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grammar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    @JsonIgnore
    private Lesson lesson;

    @Column(name = "grammar_point", nullable = false)
    private String grammarPoint;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String explanation;

    @Column(name = "usage_guide", columnDefinition = "TEXT")
    private String usageGuide;

    @Column(name = "structure_formula", columnDefinition = "TEXT")
    private String structureFormula;

    @Column(name = "common_mistakes", columnDefinition = "TEXT")
    private String commonMistakes;

    @Column(name = "formality_level")
    private String formalityLevel;

    @Column(name = "korean_pattern")
    private String koreanPattern;

    @Column(name = "example_conversations_json", columnDefinition = "TEXT")
    private String exampleConversationsJson;
}
