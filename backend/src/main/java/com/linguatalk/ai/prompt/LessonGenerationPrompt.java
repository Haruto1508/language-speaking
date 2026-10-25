package com.linguatalk.ai.prompt;

import com.linguatalk.domain.ProficiencyLevel;

public class LessonGenerationPrompt {

    private static final String TEMPLATE = """
            You are a master curriculum designer and linguist for {{language}}.
            Design a structured, communication-first lesson for level {{level}}.
            
            Topic: {{topic}}
            Scenario: {{scenario}}
            Learning Objectives: {{objectives}}
            
            REQUIREMENTS:
            1. Target Vocabulary (5-8 words/phrases): Include definition, part of speech, IPA/pronunciation, collocations, example sentences. If Korean, provide Hangul, Romanization, Batchim rules, sound changes, and word morpheme breakdown.
            2. Target Grammar (1-2 points): Pattern, structure formula, formality explanation (formal vs informal/polite), common mistakes, example conversations.
            3. Dialogue: Authentic multi-turn scenario conversation with roles, translations, and romanizations.
            4. Practice Exercises: Multiple choice, fill-in-the-blank, sentence ordering, and translation.
            5. Conversation Scenario: AI role, User role, greeting, and context.
            
            OUTPUT FORMAT:
            Valid structured JSON adhering strictly to the Lesson schema.
            """;

    public static String build(String language, ProficiencyLevel level, String topic, String scenario, String objectives) {
        return PromptBuilder.create()
                .template(TEMPLATE)
                .variable("language", language)
                .variable("level", level.name())
                .variable("topic", topic)
                .variable("scenario", scenario)
                .variable("objectives", objectives)
                .build();
    }
}
