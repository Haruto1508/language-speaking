package com.linguatalk.repository;

import com.linguatalk.domain.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    Optional<LearningProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<LearningProgress> findByUserId(Long userId);
    long countByUserIdAndCompletedTrue(Long userId);
}
