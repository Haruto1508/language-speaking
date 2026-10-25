package com.linguatalk.service;

import com.linguatalk.domain.*;
import com.linguatalk.dto.*;
import com.linguatalk.exception.ResourceNotFoundException;
import com.linguatalk.mapper.EntityMapper;
import com.linguatalk.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentService {

    private final LanguageRepository languageRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final LearningProgressRepository learningProgressRepository;
    private final VocabularyProgressRepository vocabularyProgressRepository;
    private final EntityMapper entityMapper;
    private final AuthService authService;

    public List<LanguageDto> getLanguages() {
        return languageRepository.findAll().stream()
                .map(entityMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<TopicDto> getTopics(String languageCode, String levelCode) {
        List<Topic> topics;
        if (levelCode != null && !levelCode.isBlank()) {
            topics = topicRepository.findByLanguageCodeAndLevelCodeOrderByOrderIndexAsc(languageCode, levelCode.toUpperCase());
        } else {
            topics = topicRepository.findByLanguageCodeOrderByOrderIndexAsc(languageCode);
        }

        User user = authService.getCurrentUser();

        return topics.stream().map(topic -> {
            TopicDto dto = entityMapper.toDto(topic);
            if (user != null && topic.getLessons() != null && !topic.getLessons().isEmpty()) {
                long completedCount = topic.getLessons().stream()
                        .filter(l -> learningProgressRepository.findByUserIdAndLessonId(user.getId(), l.getId())
                                .map(LearningProgress::getCompleted).orElse(false))
                        .count();
                dto.setCompletedLessons((int) completedCount);
                dto.setProgressPercentage((int) Math.round(((double) completedCount / topic.getLessons().size()) * 100));
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public TopicDto getTopicByCode(String code) {
        Topic topic = topicRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + code));
        return entityMapper.toDto(topic);
    }

    public List<LessonSummaryDto> getLessonsByTopic(Long topicId) {
        User user = authService.getCurrentUser();
        List<Lesson> lessons = lessonRepository.findByTopicIdAndStatusOrderByOrderIndexAsc(topicId, ContentStatus.PUBLISHED);

        return lessons.stream().map(lesson -> {
            LessonSummaryDto dto = entityMapper.toSummaryDto(lesson);
            if (user != null) {
                learningProgressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId())
                        .ifPresent(progress -> {
                            dto.setCompleted(progress.getCompleted());
                            dto.setScore(progress.getScore());
                        });
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public LessonDetailDto getLessonById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + id));

        LessonDetailDto dto = entityMapper.toDetailDto(lesson);

        User user = authService.getCurrentUser();
        if (user != null) {
            learningProgressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId())
                    .ifPresent(progress -> {
                        dto.setCompleted(progress.getCompleted());
                        dto.setScore(progress.getScore());
                    });

            // Attach user vocabulary status
            if (dto.getVocabulary() != null) {
                dto.getVocabulary().forEach(vocabDto -> {
                    vocabularyProgressRepository.findByUserIdAndVocabularyId(user.getId(), vocabDto.getId())
                            .ifPresent(vp -> {
                                vocabDto.setUserStatus(vp.getStatus());
                                vocabDto.setCorrectCount(vp.getCorrectCount());
                                vocabDto.setIncorrectCount(vp.getIncorrectCount());
                            });
                });
            }
        }

        return dto;
    }

    public List<VocabularyDto> getVocabulary(String languageCode) {
        User user = authService.getCurrentUser();
        List<Vocabulary> list = (languageCode != null && !languageCode.isBlank()) ?
                vocabularyRepository.findByLessonTopicLanguageCode(languageCode.toUpperCase()) :
                vocabularyRepository.findAll();

        return list.stream().map(vocab -> {
            VocabularyDto dto = entityMapper.toDto(vocab);
            if (user != null) {
                vocabularyProgressRepository.findByUserIdAndVocabularyId(user.getId(), vocab.getId())
                        .ifPresent(vp -> {
                            dto.setUserStatus(vp.getStatus());
                            dto.setCorrectCount(vp.getCorrectCount());
                            dto.setIncorrectCount(vp.getIncorrectCount());
                        });
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<GrammarDto> getGrammar(String languageCode) {
        List<Grammar> list = (languageCode != null && !languageCode.isBlank()) ?
                grammarRepository.findByLessonTopicLanguageCode(languageCode.toUpperCase()) :
                grammarRepository.findAll();

        return list.stream().map(entityMapper::toDto).collect(Collectors.toList());
    }
}
