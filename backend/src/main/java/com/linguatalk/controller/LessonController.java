package com.linguatalk.controller;

import com.linguatalk.dto.LessonDetailDto;
import com.linguatalk.dto.LessonSummaryDto;
import com.linguatalk.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<List<LessonSummaryDto>> getLessons(@RequestParam Long topicId) {
        return ResponseEntity.ok(contentService.getLessonsByTopic(topicId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonDetailDto> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getLessonById(id));
    }
}
