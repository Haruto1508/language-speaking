package com.linguatalk.controller;

import com.linguatalk.dto.LanguageDto;
import com.linguatalk.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LanguageController {

    private final ContentService contentService;

    @GetMapping("/languages")
    public ResponseEntity<List<LanguageDto>> getLanguages() {
        return ResponseEntity.ok(contentService.getLanguages());
    }

    @GetMapping("/levels")
    public ResponseEntity<List<Map<String, String>>> getLevels() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "code", "BEGINNER",
                        "name", "Beginner",
                        "cefr", "A1",
                        "topik", "TOPIK I (Level 1)",
                        "description", "Basic greetings, simple phrases, numbers, ordering food, survival travel expressions."
                ),
                Map.of(
                        "code", "ELEMENTARY",
                        "name", "Elementary",
                        "cefr", "A2",
                        "topik", "TOPIK I (Level 2)",
                        "description", "Daily routine, shopping, asking directions, family, feelings, basic past and future expressions."
                ),
                Map.of(
                        "code", "INTERMEDIATE",
                        "name", "Intermediate",
                        "cefr", "B1",
                        "topik", "TOPIK II (Level 3)",
                        "description", "Workplace conversations, reservations, expressing opinions, problem solving, informal vs formal speech."
                ),
                Map.of(
                        "code", "UPPER_INTERMEDIATE",
                        "name", "Upper Intermediate",
                        "cefr", "B2",
                        "topik", "TOPIK II (Level 4)",
                        "description", "Job interviews, business meetings, discussions on social topics, nuanced idioms and sound changes."
                ),
                Map.of(
                        "code", "ADVANCED",
                        "name", "Advanced",
                        "cefr", "C1",
                        "topik", "TOPIK II (Level 5-6)",
                        "description", "Professional negotiation, academic discussions, cultural subtleties, advanced honorifics and stylistic depth."
                )
        ));
    }
}
