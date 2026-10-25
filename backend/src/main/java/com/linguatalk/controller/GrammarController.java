package com.linguatalk.controller;

import com.linguatalk.dto.GrammarDto;
import com.linguatalk.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<List<GrammarDto>> getGrammar(
            @RequestParam(required = false) String language
    ) {
        return ResponseEntity.ok(contentService.getGrammar(language));
    }
}
