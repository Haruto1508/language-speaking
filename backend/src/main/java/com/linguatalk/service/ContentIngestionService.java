package com.linguatalk.service;

import com.linguatalk.ai.AiService;
import com.linguatalk.domain.*;
import com.linguatalk.dto.AdminDto;
import com.linguatalk.dto.LessonDetailDto;
import com.linguatalk.dto.LessonSummaryDto;
import com.linguatalk.exception.BadRequestException;
import com.linguatalk.exception.ResourceNotFoundException;
import com.linguatalk.mapper.EntityMapper;
import com.linguatalk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentIngestionService {

    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final DialogueRepository dialogueRepository;
    private final ExerciseRepository exerciseRepository;
    private final ConversationScenarioRepository scenarioRepository;
    private final AiService aiService;
    private final EntityMapper entityMapper;

    @Transactional
    public LessonDetailDto generateLessonWithAi(AdminDto.GenerateLessonRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + request.getTopicId()));

        Lesson lesson = aiService.generateLesson(topic, request);
        lesson = lessonRepository.save(lesson);

        // Cascade children entities
        if (lesson.getVocabularyList() != null) {
            vocabularyRepository.saveAll(lesson.getVocabularyList());
        }
        if (lesson.getGrammarList() != null) {
            grammarRepository.saveAll(lesson.getGrammarList());
        }
        if (lesson.getDialogues() != null) {
            dialogueRepository.saveAll(lesson.getDialogues());
        }
        if (lesson.getExercises() != null) {
            exerciseRepository.saveAll(lesson.getExercises());
        }
        if (lesson.getScenarios() != null) {
            scenarioRepository.saveAll(lesson.getScenarios());
        }

        return entityMapper.toDetailDto(lesson);
    }

    @Transactional
    public LessonSummaryDto updateLessonStatus(Long lessonId, ContentStatus newStatus) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + lessonId));

        lesson.setStatus(newStatus);
        lesson = lessonRepository.save(lesson);
        return entityMapper.toSummaryDto(lesson);
    }

    @Transactional(readOnly = true)
    public List<LessonSummaryDto> getLessonsByStatus(ContentStatus status) {
        List<Lesson> lessons = (status != null) ?
                lessonRepository.findByStatusOrderByCreatedAtDesc(status) :
                lessonRepository.findAll();

        return lessons.stream().map(entityMapper::toSummaryDto).collect(Collectors.toList());
    }

    /**
     * Ingestion pipeline simulation:
     * Document / Syllabus -> Parser -> AI Processor -> Validation -> Structured Learning Content
     */
    @Transactional
    public LessonDetailDto ingestRawSource(AdminDto.IngestContentRequest request) {
        log.info("Processing raw content ingestion for: {}", request.getTopicTitle());

        // 1. Find or create topic
        String topicCode = request.getTopicTitle().toLowerCase().replaceAll("[^a-z0-9]", "-");
        Topic topic = topicRepository.findByCode(topicCode).orElseGet(() -> {
            Topic newTopic = Topic.builder()
                    .code(topicCode)
                    .name(request.getTopicTitle())
                    .languageCode(request.getLanguageCode().toUpperCase())
                    .levelCode(request.getLevelCode().toUpperCase())
                    .description("Imported from curriculum: " + request.getTopicTitle())
                    .icon("BookOpen")
                    .estimatedMinutes(25)
                    .build();
            return topicRepository.save(newTopic);
        });

        // 2. Parse source into structured lesson generation request
        AdminDto.GenerateLessonRequest genRequest = AdminDto.GenerateLessonRequest.builder()
                .topicId(topic.getId())
                .title("Communication in " + request.getTopicTitle())
                .scenario("Situational conversation and vocabulary based on source material")
                .difficulty(ProficiencyLevel.valueOf(request.getLevelCode().toUpperCase()))
                .learningObjectives("Synthesized learning points: " + request.getRawSourceText().substring(0, Math.min(100, request.getRawSourceText().length())))
                .build();

        // 3. AI Processor & Validation
        Lesson lesson = aiService.generateLesson(topic, genRequest);
        lesson.setStatus(ContentStatus.REVIEWING); // Requires admin review
        lesson = lessonRepository.save(lesson);

        if (lesson.getVocabularyList() != null) vocabularyRepository.saveAll(lesson.getVocabularyList());
        if (lesson.getGrammarList() != null) grammarRepository.saveAll(lesson.getGrammarList());
        if (lesson.getDialogues() != null) dialogueRepository.saveAll(lesson.getDialogues());
        if (lesson.getExercises() != null) exerciseRepository.saveAll(lesson.getExercises());
        if (lesson.getScenarios() != null) scenarioRepository.saveAll(lesson.getScenarios());

        return entityMapper.toDetailDto(lesson);
    }
}
