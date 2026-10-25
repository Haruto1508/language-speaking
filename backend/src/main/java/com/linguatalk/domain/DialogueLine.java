package com.linguatalk.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dialogue_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DialogueLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dialogue_id")
    @JsonIgnore
    private Dialogue dialogue;

    @Column(name = "speaker_name")
    private String speakerName;

    @Column(name = "speaker_role")
    private String speakerRole; // e.g. "Customer", "Waiter", "Interviewer"

    @Column(name = "text_original", columnDefinition = "TEXT", nullable = false)
    private String textOriginal;

    @Column(name = "text_romanized", columnDefinition = "TEXT")
    private String textRomanized;

    @Column(name = "text_translation", columnDefinition = "TEXT", nullable = false)
    private String textTranslation;

    @Column(name = "audio_url")
    private String audioUrl;

    @Column(name = "order_index")
    @Builder.Default
    private Integer orderIndex = 0;
}
