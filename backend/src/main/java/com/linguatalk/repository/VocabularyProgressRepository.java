package com.linguatalk.repository;

import com.linguatalk.domain.VocabularyProgress;
import com.linguatalk.domain.VocabularyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VocabularyProgressRepository extends JpaRepository<VocabularyProgress, Long> {
    Optional<VocabularyProgress> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);
    List<VocabularyProgress> findByUserId(Long userId);

    @Query("SELECT vp FROM VocabularyProgress vp WHERE vp.user.id = :userId AND vp.nextReviewAt <= :now ORDER BY vp.incorrectCount DESC, vp.nextReviewAt ASC")
    List<VocabularyProgress> findDueReviews(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    long countByUserIdAndStatus(Long userId, VocabularyStatus status);

    @Query("SELECT vp FROM VocabularyProgress vp JOIN vp.vocabulary v JOIN v.lesson l JOIN l.topic t WHERE vp.user.id = :userId AND t.languageCode = :langCode")
    List<VocabularyProgress> findByUserAndLanguage(@Param("userId") Long userId, @Param("langCode") String langCode);
}
