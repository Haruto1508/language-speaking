package com.linguatalk.repository;

import com.linguatalk.domain.ContentStatus;
import com.linguatalk.domain.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByTopicIdAndStatusOrderByOrderIndexAsc(Long topicId, ContentStatus status);
    List<Lesson> findByTopicIdOrderByOrderIndexAsc(Long topicId);
    List<Lesson> findByStatusOrderByCreatedAtDesc(ContentStatus status);
}
