package com.linguatalk.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vocabulary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    @JsonIgnore
    private Lesson lesson;

    @Column(nullable = false)
    private String word;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String meaning;

    @Column(name = "part_of_speech")
    private String partOfSpeech;

    @Column(name = "pronunciation_ipa")
    private String pronunciationIpa;

    @Column(name = "example_sentence", columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(columnDefinition = "TEXT")
    private String translation;

    private String difficulty;

    @Column(name = "related_words")
    private String relatedWords;

    @Column(columnDefinition = "TEXT")
    private String collocations;

    // Korean specific fields
    private String hangul;
    private String romanization;

    @Column(name = "batchim_rules", columnDefinition = "TEXT")
    private String batchimRules;

    @Column(name = "sound_changes", columnDefinition = "TEXT")
    private String soundChanges;

    @Column(name = "breakdown_json", columnDefinition = "TEXT")
    private String breakdownJson;
}
