package com.linguatalk.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    @Column(name = "target_language")
    @Builder.Default
    private String targetLanguage = "KO"; // KO or EN

    @Enumerated(EnumType.STRING)
    @Column(name = "target_level")
    @Builder.Default
    private ProficiencyLevel targetLevel = ProficiencyLevel.BEGINNER;

    @Column(name = "streak_count")
    @Builder.Default
    private Integer streakCount = 1;

    @Column(name = "last_study_date")
    private LocalDate lastStudyDate;

    @Column(name = "daily_goal_minutes")
    @Builder.Default
    private Integer dailyGoalMinutes = 15;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.lastStudyDate == null) {
            this.lastStudyDate = LocalDate.now();
        }
    }
}
