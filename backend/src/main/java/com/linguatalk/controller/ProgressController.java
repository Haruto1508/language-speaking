package com.linguatalk.controller;

import com.linguatalk.dto.DashboardSummaryDto;
import com.linguatalk.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboard() {
        return ResponseEntity.ok(progressService.getDashboardSummary());
    }

    @PostMapping("/complete-lesson")
    public ResponseEntity<Map<String, Object>> completeLesson(@RequestBody Map<String, Object> body) {
        Long lessonId = Long.valueOf(body.get("lessonId").toString());
        int score = body.containsKey("score") ? Integer.parseInt(body.get("score").toString()) : 100;
        int timeSpent = body.containsKey("timeSpentSeconds") ? Integer.parseInt(body.get("timeSpentSeconds").toString()) : 600;

        progressService.recordLessonCompletion(lessonId, score, timeSpent);
        return ResponseEntity.ok(Map.of("success", true, "message", "Lesson completion recorded"));
    }
}
