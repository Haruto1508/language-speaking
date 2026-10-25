package com.linguatalk.repository;

import com.linguatalk.domain.ConversationScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationScenarioRepository extends JpaRepository<ConversationScenario, Long> {
    List<ConversationScenario> findByLanguageCode(String languageCode);
    List<ConversationScenario> findByLanguageCodeAndLevelCode(String languageCode, String levelCode);
    List<ConversationScenario> findByLessonId(Long lessonId);
}
