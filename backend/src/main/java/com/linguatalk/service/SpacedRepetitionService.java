package com.linguatalk.service;

import com.linguatalk.domain.*;
import com.linguatalk.dto.ReviewDto;
import com.linguatalk.exception.ResourceNotFoundException;
import com.linguatalk.repository.UserRepository;
import com.linguatalk.repository.VocabularyProgressRepository;
import com.linguatalk.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpacedRepetitionService {

    private final VocabularyProgressRepository vocabularyProgressRepository;
    private final VocabularyRepository vocabularyRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional
    public List<ReviewDto.ReviewItemDto> getDueReviews(int limit) {
        User user = authService.getCurrentUser();
        if (user == null) {
            return List.of();
        }

        LocalDateTime now = LocalDateTime.now();
        List<VocabularyProgress> dueList = vocabularyProgressRepository.findDueReviews(user.getId(), now);

        // If user has fewer due reviews than requested limit, initialize progress for unstudied vocabulary
        if (dueList.size() < limit) {
            List<Vocabulary> allVocab = vocabularyRepository.findByLessonTopicLanguageCode(user.getTargetLanguage());
            for (Vocabulary vocab : allVocab) {
                if (dueList.size() >= limit) break;
                boolean alreadyTracked = vocabularyProgressRepository.findByUserIdAndVocabularyId(user.getId(), vocab.getId()).isPresent();
                if (!alreadyTracked) {
                    VocabularyProgress vp = VocabularyProgress.builder()
                            .user(user)
                            .vocabulary(vocab)
                            .status(VocabularyStatus.NEW)
                            .repetitions(0)
                            .correctCount(0)
                            .incorrectCount(0)
                            .easeFactor(2.5)
                            .intervalDays(1)
                            .nextReviewAt(LocalDateTime.now())
                            .build();
                    vp = vocabularyProgressRepository.save(vp);
                    dueList.add(vp);
                }
            }
        }

        return dueList.stream()
                .limit(limit)
                .map(this::mapToItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto.ReviewItemDto submitReview(ReviewDto.ReviewSubmission submission) {
        User user = authService.getCurrentUser();
        VocabularyProgress progress = vocabularyProgressRepository.findByUserIdAndVocabularyId(user.getId(), submission.getVocabularyId())
                .orElseGet(() -> {
                    Vocabulary vocab = vocabularyRepository.findById(submission.getVocabularyId())
                            .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found: " + submission.getVocabularyId()));
                    return VocabularyProgress.builder()
                            .user(user)
                            .vocabulary(vocab)
                            .status(VocabularyStatus.NEW)
                            .repetitions(0)
                            .correctCount(0)
                            .incorrectCount(0)
                            .easeFactor(2.5)
                            .intervalDays(1)
                            .build();
                });

        int rating = submission.getRating(); // 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
        progress.setLastReviewedAt(LocalDateTime.now());

        // SM-2 Spaced Repetition Algorithm Adaptation
        if (rating == 1) { // Again (Failed)
            progress.setIncorrectCount(progress.getIncorrectCount() + 1);
            progress.setRepetitions(0);
            progress.setIntervalDays(1);
            progress.setStatus(VocabularyStatus.LEARNING);
            progress.setEaseFactor(Math.max(1.3, progress.getEaseFactor() - 0.2));
            progress.setNextReviewAt(LocalDateTime.now().plusMinutes(10)); // Review soon
        } else {
            progress.setCorrectCount(progress.getCorrectCount() + 1);
            int reps = progress.getRepetitions() + 1;
            progress.setRepetitions(reps);

            double ef = progress.getEaseFactor();
            if (rating == 2) { // Hard
                ef = Math.max(1.3, ef - 0.15);
                progress.setIntervalDays(Math.max(1, (int) Math.round(progress.getIntervalDays() * 1.2)));
                progress.setStatus(VocabularyStatus.LEARNING);
            } else if (rating == 3) { // Good
                if (reps == 1) {
                    progress.setIntervalDays(1);
                } else if (reps == 2) {
                    progress.setIntervalDays(3);
                } else {
                    progress.setIntervalDays((int) Math.round(progress.getIntervalDays() * ef));
                }
                progress.setStatus(reps >= 4 ? VocabularyStatus.REVIEW : VocabularyStatus.LEARNING);
            } else if (rating == 4) { // Easy
                ef = ef + 0.15;
                if (reps == 1) {
                    progress.setIntervalDays(3);
                } else {
                    progress.setIntervalDays((int) Math.round(progress.getIntervalDays() * ef * 1.3));
                }
                progress.setStatus(reps >= 3 ? VocabularyStatus.MASTERED : VocabularyStatus.REVIEW);
            }
            progress.setEaseFactor(ef);
            progress.setNextReviewAt(LocalDateTime.now().plusDays(progress.getIntervalDays()));
        }

        progress = vocabularyProgressRepository.save(progress);
        return mapToItemDto(progress);
    }

    private ReviewDto.ReviewItemDto mapToItemDto(VocabularyProgress vp) {
        Vocabulary v = vp.getVocabulary();
        return ReviewDto.ReviewItemDto.builder()
                .progressId(vp.getId())
                .vocabularyId(v.getId())
                .word(v.getWord())
                .meaning(v.getMeaning())
                .partOfSpeech(v.getPartOfSpeech())
                .pronunciationIpa(v.getPronunciationIpa())
                .exampleSentence(v.getExampleSentence())
                .translation(v.getTranslation())
                .hangul(v.getHangul())
                .romanization(v.getRomanization())
                .status(vp.getStatus())
                .repetitions(vp.getRepetitions())
                .correctCount(vp.getCorrectCount())
                .incorrectCount(vp.getIncorrectCount())
                .nextReviewAt(vp.getNextReviewAt())
                .build();
    }
}
