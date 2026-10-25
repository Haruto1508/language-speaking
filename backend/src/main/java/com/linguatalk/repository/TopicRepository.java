package com.linguatalk.repository;

import com.linguatalk.domain.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByLanguageCodeAndLevelCodeOrderByOrderIndexAsc(String languageCode, String levelCode);
    List<Topic> findByLanguageCodeOrderByOrderIndexAsc(String languageCode);
    Optional<Topic> findByCode(String code);
}
