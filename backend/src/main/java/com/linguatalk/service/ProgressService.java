package com.linguatalk.service;

import com.linguatalk.domain.*;
import com.linguatalk.dto.DashboardSummaryDto;
import com.linguatalk.dto.LessonSummaryDto;
import com.linguatalk.exception.ResourceNotFoundException;
import com.linguatalk.mapper.EntityMapper;
import com.linguatalk.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final LearningProgressRepository learningProgressRepository;
    private final VocabularyProgressRepository vocabularyProgressRepository;
    private final GrammarRepository grammarRepository;
    private final ConversationSessionRepository sessionRepository;
    private final MistakeRepository mistakeRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final EntityMapper entityMapper;

    @Transactional
    public void recordLessonCompletion(Long lessonId, int score, int timeSpentSeconds) {
        User user = authService.getCurrentUser();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        LearningProgress progress = learningProgressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> LearningProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .build());

        progress.setCompleted(true);
        progress.setScore(Math.max(progress.getScore(), score));
        progress.setCompletedAt(LocalDateTime.now());
        progress.setTimeSpentSeconds(progress.getTimeSpentSeconds() + timeSpentSeconds);
        learningProgressRepository.save(progress);

        // Update user study date and streak
        LocalDate today = LocalDate.now();
        if (user.getLastStudyDate() != null) {
            if (user.getLastStudyDate().equals(today.minusDays(1))) {
                user.setStreakCount(user.getStreakCount() + 1);
            } else if (!user.getLastStudyDate().equals(today)) {
                user.setStreakCount(1);
            }
        } else {
            user.setStreakCount(1);
        }
        user.setLastStudyDate(today);
        userRepository.save(user);

        // Initialize vocabulary progress for this lesson's vocab
        if (lesson.getVocabularyList() != null) {
            for (Vocabulary vocab : lesson.getVocabularyList()) {
                if (vocabularyProgressRepository.findByUserIdAndVocabularyId(user.getId(), vocab.getId()).isEmpty()) {
                    VocabularyProgress vp = VocabularyProgress.builder()
                            .user(user)
                            .vocabulary(vocab)
                            .status(VocabularyStatus.LEARNING)
                            .repetitions(1)
                            .correctCount(1)
                            .incorrectCount(0)
                            .easeFactor(2.5)
                            .intervalDays(1)
                            .lastReviewedAt(LocalDateTime.now())
                            .nextReviewAt(LocalDateTime.now().plusDays(1))
                            .build();
                    vocabularyProgressRepository.save(vp);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        User user = authService.getCurrentUser();
        if (user == null) {
            return DashboardSummaryDto.builder().build();
        }

        long completedLessons = learningProgressRepository.countByUserIdAndCompletedTrue(user.getId());
        long vocabMastered = vocabularyProgressRepository.countByUserIdAndStatus(user.getId(), VocabularyStatus.MASTERED);
        long vocabLearned = vocabularyProgressRepository.findByUserId(user.getId()).size();
        long grammarCount = grammarRepository.findByLessonTopicLanguageCode(user.getTargetLanguage()).size();
        List<ConversationSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());
        int convCount = (int) sessions.stream().filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus())).count();

        List<VocabularyProgress> dueReviews = vocabularyProgressRepository.findDueReviews(user.getId(), LocalDateTime.now());
        List<Mistake> recentMistakes = mistakeRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getId());

        // Recommended next lesson: find the first uncompleted lesson for user's language & level
        List<Lesson> allLessons = lessonRepository.findByStatusOrderByCreatedAtDesc(ContentStatus.PUBLISHED);
        Lesson recommended = allLessons.stream()
                .filter(l -> l.getTopic() != null && l.getTopic().getLanguageCode().equalsIgnoreCase(user.getTargetLanguage()))
                .filter(l -> learningProgressRepository.findByUserIdAndLessonId(user.getId(), l.getId())
                        .map(p -> !p.getCompleted()).orElse(true))
                .findFirst()
                .orElse(allLessons.isEmpty() ? null : allLessons.get(0));

        LessonSummaryDto recommendedDto = recommended != null ? entityMapper.toSummaryDto(recommended) : null;

        return DashboardSummaryDto.builder()
                .streakCount(user.getStreakCount())
                .dailyGoalMinutes(user.getDailyGoalMinutes())
                .minutesStudiedToday(Math.min(user.getDailyGoalMinutes(), 12)) // simulated active session
                .vocabularyLearnedCount(vocabLearned)
                .vocabularyMasteredCount(vocabMastered)
                .lessonsCompletedCount(completedLessons)
                .grammarPointsCount(grammarCount)
                .conversationsCompletedCount(convCount)
                .dueReviewsCount(dueReviews.size())
                .recommendedLesson(recommendedDto)
                .recentMistakes(recentMistakes.stream().map(entityMapper::toDto).collect(Collectors.toList()))
                .build();
    }
}
