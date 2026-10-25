package com.linguatalk.repository;

import com.linguatalk.domain.Mistake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MistakeRepository extends JpaRepository<Mistake, Long> {
    List<Mistake> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Mistake> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
