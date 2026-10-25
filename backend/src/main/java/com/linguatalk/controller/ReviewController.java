package com.linguatalk.controller;

import com.linguatalk.dto.ReviewDto;
import com.linguatalk.service.SpacedRepetitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final SpacedRepetitionService spacedRepetitionService;

    @GetMapping("/due")
    public ResponseEntity<List<ReviewDto.ReviewItemDto>> getDueReviews(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(spacedRepetitionService.getDueReviews(limit));
    }

    @PostMapping("/submit")
    public ResponseEntity<ReviewDto.ReviewItemDto> submitReview(
            @Valid @RequestBody ReviewDto.ReviewSubmission submission
    ) {
        return ResponseEntity.ok(spacedRepetitionService.submitReview(submission));
    }
}
