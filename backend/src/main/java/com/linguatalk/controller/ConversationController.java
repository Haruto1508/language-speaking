package com.linguatalk.controller;

import com.linguatalk.dto.ConversationDto;
import com.linguatalk.dto.ConversationScenarioDto;
import com.linguatalk.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping("/scenarios")
    public ResponseEntity<List<ConversationScenarioDto>> getScenarios(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String level
    ) {
        return ResponseEntity.ok(conversationService.getScenarios(language, level));
    }

    @GetMapping("/scenarios/{id}")
    public ResponseEntity<ConversationScenarioDto> getScenarioById(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getScenarioById(id));
    }

    @PostMapping("/start")
    public ResponseEntity<ConversationDto.SessionDto> startSession(@Valid @RequestBody ConversationDto.StartRequest request) {
        return ResponseEntity.ok(conversationService.startSession(request.getScenarioId()));
    }

    @PostMapping("/reply")
    public ResponseEntity<ConversationDto.SessionDto> reply(@Valid @RequestBody ConversationDto.ReplyRequest request) {
        return ResponseEntity.ok(conversationService.reply(request.getSessionId(), request.getMessage()));
    }

    @PostMapping("/complete/{sessionId}")
    public ResponseEntity<ConversationDto.FeedbackDto> completeSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(conversationService.completeSession(sessionId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ConversationDto.SessionDto> getSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(conversationService.getSessionById(sessionId));
    }
}
