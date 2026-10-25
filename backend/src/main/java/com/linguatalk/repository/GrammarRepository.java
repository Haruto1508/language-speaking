package com.linguatalk.repository;

import com.linguatalk.domain.Grammar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarRepository extends JpaRepository<Grammar, Long> {
    List<Grammar> findByLessonId(Long lessonId);
    List<Grammar> findByLessonTopicLanguageCode(String languageCode);
}
