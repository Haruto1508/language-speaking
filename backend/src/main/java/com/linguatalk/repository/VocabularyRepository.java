package com.linguatalk.repository;

import com.linguatalk.domain.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    List<Vocabulary> findByLessonId(Long lessonId);
    List<Vocabulary> findByLessonTopicLanguageCode(String languageCode);
}
