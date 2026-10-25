package com.linguatalk.ai;

import com.linguatalk.domain.ConversationScenario;
import com.linguatalk.domain.ConversationSession;
import com.linguatalk.domain.Lesson;
import com.linguatalk.domain.Topic;
import com.linguatalk.dto.AdminDto;

import java.util.List;

public interface AiService {

    Lesson generateLesson(Topic topic, AdminDto.GenerateLessonRequest request);

    ConversationReply generateConversationResponse(ConversationSession session, String userMessage);

    ConversationAnalysis analyzeConversation(ConversationSession session);

    record ConversationReply(
            String aiReply,
            String grammarFeedback,
            String suggestedAlternative
    ) {}

    record ConversationAnalysis(
            int overallScore,
            int fluencyScore,
            int grammarScore,
            int vocabularyScore,
            String feedbackSummary,
            List<String> grammarMistakes,
            List<String> vocabularyMistakes,
            List<String> moreNaturalExpressions,
            List<String> usefulVocabulary,
            List<String> suggestedAlternativeSentences
    ) {}
}
