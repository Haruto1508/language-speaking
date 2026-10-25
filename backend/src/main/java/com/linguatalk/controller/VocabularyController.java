package com.linguatalk.controller;

import com.linguatalk.dto.VocabularyDto;
import com.linguatalk.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
public class VocabularyController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<List<VocabularyDto>> getVocabulary(
            @RequestParam(required = false) String language
    ) {
        return ResponseEntity.ok(contentService.getVocabulary(language));
    }
}
