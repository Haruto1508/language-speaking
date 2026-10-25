package com.linguatalk.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linguatalk.ai.AiService;
import com.linguatalk.domain.*;
import com.linguatalk.dto.ConversationDto;
import com.linguatalk.dto.ConversationScenarioDto;
import com.linguatalk.exception.ResourceNotFoundException;
import com.linguatalk.mapper.EntityMapper;
import com.linguatalk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationScenarioRepository scenarioRepository;
    private final ConversationSessionRepository sessionRepository;
    private final ConversationMessageRepository messageRepository;
    private final MistakeRepository mistakeRepository;
    private final AuthService authService;
    private final AiService aiService;
    private final EntityMapper entityMapper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<ConversationScenarioDto> getScenarios(String languageCode, String levelCode) {
        List<ConversationScenario> scenarios;
        if (levelCode != null && !levelCode.isBlank()) {
            scenarios = scenarioRepository.findByLanguageCodeAndLevelCode(languageCode.toUpperCase(), levelCode.toUpperCase());
        } else if (languageCode != null && !languageCode.isBlank()) {
            scenarios = scenarioRepository.findByLanguageCode(languageCode.toUpperCase());
        } else {
            scenarios = scenarioRepository.findAll();
        }
        return scenarios.stream().map(entityMapper::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationScenarioDto getScenarioById(Long id) {
        ConversationScenario scenario = scenarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found with id: " + id));
        return entityMapper.toDto(scenario);
    }

    @Transactional
    public ConversationDto.SessionDto startSession(Long scenarioId) {
        User user = authService.getCurrentUser();
        ConversationScenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found with id: " + scenarioId));

        ConversationSession session = ConversationSession.builder()
                .user(user)
                .scenario(scenario)
                .status("ACTIVE")
                .startedAt(LocalDateTime.now())
                .build();
        session = sessionRepository.save(session);

        // Add initial AI greeting
        ConversationMessage greeting = ConversationMessage.builder()
                .session(session)
                .senderRole("AI")
                .content(scenario.getInitialGreeting())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(greeting);
        session.getMessages().add(greeting);

        return entityMapper.toDto(session);
    }

    @Transactional
    public ConversationDto.SessionDto reply(Long sessionId, String userText) {
        ConversationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        // 1. Record user message
        ConversationMessage userMsg = ConversationMessage.builder()
                .session(session)
                .senderRole("USER")
                .content(userText)
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(userMsg);
        session.getMessages().add(userMsg);

        // 2. Generate AI response
        AiService.ConversationReply reply = aiService.generateConversationResponse(session, userText);

        // 3. Record AI message with feedback & suggested alternative
        ConversationMessage aiMsg = ConversationMessage.builder()
                .session(session)
                .senderRole("AI")
                .content(reply.aiReply())
                .grammarFeedback(reply.grammarFeedback())
                .suggestedAlternative(reply.suggestedAlternative())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(aiMsg);
        session.getMessages().add(aiMsg);

        return entityMapper.toDto(session);
    }

    @Transactional
    public ConversationDto.FeedbackDto completeSession(Long sessionId) {
        ConversationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        session.setStatus("COMPLETED");
        session.setCompletedAt(LocalDateTime.now());

        AiService.ConversationAnalysis analysis = aiService.analyzeConversation(session);

        session.setOverallScore(analysis.overallScore());
        session.setFluencyScore(analysis.fluencyScore());
        session.setGrammarScore(analysis.grammarScore());
        session.setVocabularyScore(analysis.vocabularyScore());
        session.setFeedbackSummary(analysis.feedbackSummary());

        try {
            session.setNaturalExpressionsJson(objectMapper.writeValueAsString(analysis.moreNaturalExpressions()));
            session.setMistakesJson(objectMapper.writeValueAsString(analysis.grammarMistakes()));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize feedback JSON", e);
        }

        sessionRepository.save(session);

        // Record any identified mistakes for future spaced review
        if (session.getUser() != null && analysis.grammarMistakes() != null) {
            for (String mistakeText : analysis.grammarMistakes()) {
                Mistake mistake = Mistake.builder()
                        .user(session.getUser())
                        .lesson(session.getScenario() != null ? session.getScenario().getLesson() : null)
                        .type("GRAMMAR")
                        .originalText("From Conversation: " + session.getScenario().getTitle())
                        .correctedText(mistakeText)
                        .explanation(analysis.feedbackSummary())
                        .reviewed(false)
                        .build();
                mistakeRepository.save(mistake);
            }
        }

        return ConversationDto.FeedbackDto.builder()
                .sessionId(session.getId())
                .overallScore(analysis.overallScore())
                .fluencyScore(analysis.fluencyScore())
                .grammarScore(analysis.grammarScore())
                .vocabularyScore(analysis.vocabularyScore())
                .feedbackSummary(analysis.feedbackSummary())
                .grammarMistakes(analysis.grammarMistakes())
                .vocabularyMistakes(analysis.vocabularyMistakes())
                .moreNaturalExpressions(analysis.moreNaturalExpressions())
                .usefulVocabulary(analysis.usefulVocabulary())
                .suggestedAlternativeSentences(analysis.suggestedAlternativeSentences())
                .build();
    }

    @Transactional(readOnly = true)
    public ConversationDto.SessionDto getSessionById(Long sessionId) {
        ConversationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        return entityMapper.toDto(session);
    }
}
