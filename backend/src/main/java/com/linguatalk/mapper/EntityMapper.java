package com.linguatalk.mapper;

import com.linguatalk.domain.*;
import com.linguatalk.dto.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public LanguageDto toDto(Language entity) {
        if (entity == null) return null;
        return LanguageDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .nativeName(entity.getNativeName())
                .flagEmoji(entity.getFlagEmoji())
                .build();
    }

    public TopicDto toDto(Topic entity) {
        if (entity == null) return null;
        return TopicDto.builder()
                .id(entity.getId())
                .languageCode(entity.getLanguageCode())
                .levelCode(entity.getLevelCode())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .icon(entity.getIcon())
                .estimatedMinutes(entity.getEstimatedMinutes())
                .totalLessons(entity.getLessons() != null ? entity.getLessons().size() : 0)
                .completedLessons(0)
                .progressPercentage(0)
                .lessons(entity.getLessons() != null ?
                        entity.getLessons().stream().map(this::toSummaryDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .build();
    }

    public LessonSummaryDto toSummaryDto(Lesson entity) {
        if (entity == null) return null;
        return LessonSummaryDto.builder()
                .id(entity.getId())
                .topicId(entity.getTopic() != null ? entity.getTopic().getId() : null)
                .topicName(entity.getTopic() != null ? entity.getTopic().getName() : "")
                .title(entity.getTitle())
                .scenario(entity.getScenario())
                .description(entity.getDescription())
                .difficulty(entity.getDifficulty())
                .status(entity.getStatus())
                .orderIndex(entity.getOrderIndex())
                .vocabularyCount(entity.getVocabularyList() != null ? entity.getVocabularyList().size() : 0)
                .grammarCount(entity.getGrammarList() != null ? entity.getGrammarList().size() : 0)
                .exercisesCount(entity.getExercises() != null ? entity.getExercises().size() : 0)
                .completed(false)
                .score(0)
                .build();
    }

    public LessonDetailDto toDetailDto(Lesson entity) {
        if (entity == null) return null;
        return LessonDetailDto.builder()
                .id(entity.getId())
                .topicId(entity.getTopic() != null ? entity.getTopic().getId() : null)
                .topicName(entity.getTopic() != null ? entity.getTopic().getName() : "")
                .languageCode(entity.getTopic() != null ? entity.getTopic().getLanguageCode() : "KO")
                .title(entity.getTitle())
                .scenario(entity.getScenario())
                .description(entity.getDescription())
                .difficulty(entity.getDifficulty())
                .status(entity.getStatus())
                .learningObjectives(entity.getLearningObjectives())
                .culturalNotes(entity.getCulturalNotes())
                .formalityExplanation(entity.getFormalityExplanation())
                .orderIndex(entity.getOrderIndex())
                .vocabulary(entity.getVocabularyList() != null ?
                        entity.getVocabularyList().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .grammar(entity.getGrammarList() != null ?
                        entity.getGrammarList().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .dialogues(entity.getDialogues() != null ?
                        entity.getDialogues().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .exercises(entity.getExercises() != null ?
                        entity.getExercises().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .scenarios(entity.getScenarios() != null ?
                        entity.getScenarios().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .completed(false)
                .score(0)
                .build();
    }

    public VocabularyDto toDto(Vocabulary entity) {
        if (entity == null) return null;
        return VocabularyDto.builder()
                .id(entity.getId())
                .lessonId(entity.getLesson() != null ? entity.getLesson().getId() : null)
                .word(entity.getWord())
                .meaning(entity.getMeaning())
                .partOfSpeech(entity.getPartOfSpeech())
                .pronunciationIpa(entity.getPronunciationIpa())
                .exampleSentence(entity.getExampleSentence())
                .translation(entity.getTranslation())
                .difficulty(entity.getDifficulty())
                .relatedWords(entity.getRelatedWords())
                .collocations(entity.getCollocations())
                .hangul(entity.getHangul())
                .romanization(entity.getRomanization())
                .batchimRules(entity.getBatchimRules())
                .soundChanges(entity.getSoundChanges())
                .breakdownJson(entity.getBreakdownJson())
                .build();
    }

    public GrammarDto toDto(Grammar entity) {
        if (entity == null) return null;
        return GrammarDto.builder()
                .id(entity.getId())
                .lessonId(entity.getLesson() != null ? entity.getLesson().getId() : null)
                .grammarPoint(entity.getGrammarPoint())
                .explanation(entity.getExplanation())
                .usageGuide(entity.getUsageGuide())
                .structureFormula(entity.getStructureFormula())
                .commonMistakes(entity.getCommonMistakes())
                .formalityLevel(entity.getFormalityLevel())
                .koreanPattern(entity.getKoreanPattern())
                .exampleConversationsJson(entity.getExampleConversationsJson())
                .build();
    }

    public DialogueDto toDto(Dialogue entity) {
        if (entity == null) return null;
        return DialogueDto.builder()
                .id(entity.getId())
                .lessonId(entity.getLesson() != null ? entity.getLesson().getId() : null)
                .title(entity.getTitle())
                .contextDescription(entity.getContextDescription())
                .userRole(entity.getUserRole())
                .partnerRole(entity.getPartnerRole())
                .lines(entity.getLines() != null ?
                        entity.getLines().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .build();
    }

    public DialogueDto.DialogueLineDto toDto(DialogueLine entity) {
        if (entity == null) return null;
        return DialogueDto.DialogueLineDto.builder()
                .id(entity.getId())
                .speakerName(entity.getSpeakerName())
                .speakerRole(entity.getSpeakerRole())
                .textOriginal(entity.getTextOriginal())
                .textRomanized(entity.getTextRomanized())
                .textTranslation(entity.getTextTranslation())
                .audioUrl(entity.getAudioUrl())
                .orderIndex(entity.getOrderIndex())
                .build();
    }

    public ExerciseDto toDto(Exercise entity) {
        if (entity == null) return null;
        return ExerciseDto.builder()
                .id(entity.getId())
                .lessonId(entity.getLesson() != null ? entity.getLesson().getId() : null)
                .title(entity.getTitle())
                .type(entity.getType())
                .questions(entity.getQuestions() != null ?
                        entity.getQuestions().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .build();
    }

    public ExerciseDto.ExerciseQuestionDto toDto(ExerciseQuestion entity) {
        if (entity == null) return null;
        return ExerciseDto.ExerciseQuestionDto.builder()
                .id(entity.getId())
                .prompt(entity.getPrompt())
                .audioUrl(entity.getAudioUrl())
                .optionsJson(entity.getOptionsJson())
                .correctAnswer(entity.getCorrectAnswer())
                .explanation(entity.getExplanation())
                .orderIndex(entity.getOrderIndex())
                .build();
    }

    public ConversationScenarioDto toDto(ConversationScenario entity) {
        if (entity == null) return null;
        return ConversationScenarioDto.builder()
                .id(entity.getId())
                .lessonId(entity.getLesson() != null ? entity.getLesson().getId() : null)
                .topicCode(entity.getTopicCode())
                .languageCode(entity.getLanguageCode())
                .levelCode(entity.getLevelCode())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .userRole(entity.getUserRole())
                .aiRole(entity.getAiRole())
                .initialGreeting(entity.getInitialGreeting())
                .culturalContext(entity.getCulturalContext())
                .build();
    }

    public ConversationDto.SessionDto toDto(ConversationSession entity) {
        if (entity == null) return null;
        return ConversationDto.SessionDto.builder()
                .id(entity.getId())
                .scenario(toScenarioDto(entity.getScenario()))
                .status(entity.getStatus())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .overallScore(entity.getOverallScore())
                .fluencyScore(entity.getFluencyScore())
                .grammarScore(entity.getGrammarScore())
                .vocabularyScore(entity.getVocabularyScore())
                .feedbackSummary(entity.getFeedbackSummary())
                .naturalExpressionsJson(entity.getNaturalExpressionsJson())
                .mistakesJson(entity.getMistakesJson())
                .messages(entity.getMessages() != null ?
                        entity.getMessages().stream().map(this::toDto).collect(Collectors.toList()) :
                        Collections.emptyList())
                .build();
    }

    public ConversationDto.ScenarioDto toScenarioDto(ConversationScenario entity) {
        if (entity == null) return null;
        return ConversationDto.ScenarioDto.builder()
                .id(entity.getId())
                .lessonId(entity.getLesson() != null ? entity.getLesson().getId() : null)
                .topicCode(entity.getTopicCode())
                .languageCode(entity.getLanguageCode())
                .levelCode(entity.getLevelCode())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .userRole(entity.getUserRole())
                .aiRole(entity.getAiRole())
                .initialGreeting(entity.getInitialGreeting())
                .culturalContext(entity.getCulturalContext())
                .build();
    }

    public ConversationDto.MessageDto toDto(ConversationMessage entity) {
        if (entity == null) return null;
        return ConversationDto.MessageDto.builder()
                .id(entity.getId())
                .senderRole(entity.getSenderRole())
                .content(entity.getContent())
                .timestamp(entity.getTimestamp())
                .grammarFeedback(entity.getGrammarFeedback())
                .suggestedAlternative(entity.getSuggestedAlternative())
                .build();
    }

    public DashboardSummaryDto.MistakeDto toDto(Mistake entity) {
        if (entity == null) return null;
        return DashboardSummaryDto.MistakeDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .originalText(entity.getOriginalText())
                .correctedText(entity.getCorrectedText())
                .explanation(entity.getExplanation())
                .reviewed(entity.getReviewed())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
