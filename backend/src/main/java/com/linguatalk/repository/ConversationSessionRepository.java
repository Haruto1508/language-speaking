package com.linguatalk.repository;

import com.linguatalk.domain.ConversationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationSessionRepository extends JpaRepository<ConversationSession, Long> {
    List<ConversationSession> findByUserIdOrderByStartedAtDesc(Long userId);
    List<ConversationSession> findTop5ByUserIdOrderByStartedAtDesc(Long userId);
}
