package com.linguatalk.controller;

import com.linguatalk.domain.ContentStatus;
import com.linguatalk.dto.AdminDto;
import com.linguatalk.dto.LessonDetailDto;
import com.linguatalk.dto.LessonSummaryDto;
import com.linguatalk.service.ContentIngestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminContentController {

    private final ContentIngestionService ingestionService;

    @GetMapping("/lessons")
    public ResponseEntity<List<LessonSummaryDto>> getLessons(
            @RequestParam(required = false) ContentStatus status
    ) {
        return ResponseEntity.ok(ingestionService.getLessonsByStatus(status));
    }

    @PostMapping("/generate-lesson")
    public ResponseEntity<LessonDetailDto> generateLesson(
            @Valid @RequestBody AdminDto.GenerateLessonRequest request
    ) {
        return ResponseEntity.ok(ingestionService.generateLessonWithAi(request));
    }

    @PatchMapping("/lessons/{id}/status")
    public ResponseEntity<LessonSummaryDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminDto.UpdateLessonStatusRequest request
    ) {
        return ResponseEntity.ok(ingestionService.updateLessonStatus(id, request.getStatus()));
    }

    @PostMapping("/ingest")
    public ResponseEntity<LessonDetailDto> ingestRawSource(
            @Valid @RequestBody AdminDto.IngestContentRequest request
    ) {
        return ResponseEntity.ok(ingestionService.ingestRawSource(request));
    }
}
