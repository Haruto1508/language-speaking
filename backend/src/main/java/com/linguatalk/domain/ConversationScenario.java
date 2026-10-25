package com.linguatalk.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "conversation_scenarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    @JsonIgnore
    private Lesson lesson;

    @Column(name = "topic_code")
    private String topicCode;

    @Column(name = "language_code", length = 10)
    private String languageCode; // EN, KO

    @Column(name = "level_code", length = 50)
    private String levelCode; // BEGINNER, ELEMENTARY, etc.

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "user_role", nullable = false)
    private String userRole; // e.g., "Customer"

    @Column(name = "ai_role", nullable = false)
    private String aiRole; // e.g., "Waiter"

    @Column(name = "system_prompt", columnDefinition = "TEXT")
    private String systemPrompt;

    @Column(name = "initial_greeting", columnDefinition = "TEXT", nullable = false)
    private String initialGreeting;

    @Column(name = "cultural_context", columnDefinition = "TEXT")
    private String culturalContext;
}
