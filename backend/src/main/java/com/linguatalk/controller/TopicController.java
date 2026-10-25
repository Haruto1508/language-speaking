package com.linguatalk.controller;

import com.linguatalk.dto.TopicDto;
import com.linguatalk.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<List<TopicDto>> getTopics(
            @RequestParam(defaultValue = "KO") String language,
            @RequestParam(required = false) String level
    ) {
        return ResponseEntity.ok(contentService.getTopics(language, level));
    }

    @GetMapping("/{code}")
    public ResponseEntity<TopicDto> getTopicByCode(@PathVariable String code) {
        return ResponseEntity.ok(contentService.getTopicByCode(code));
    }
}
