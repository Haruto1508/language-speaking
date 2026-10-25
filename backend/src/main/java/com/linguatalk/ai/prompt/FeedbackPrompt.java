package com.linguatalk.ai.prompt;

public class FeedbackPrompt {

    private static final String TEMPLATE = """
            You are an expert language proficiency assessor.
            Evaluate this complete conversation between a {{level}} learner ({{userRole}}) and the AI ({{aiRole}}) in {{language}}.
            
            Full Dialogue:
            {{fullDialogue}}
            
            Analyze the learner's performance:
            1. Fluency score (0-100)
            2. Grammar score (0-100)
            3. Vocabulary score (0-100)
            4. Overall score (0-100)
            5. Grammar mistakes with corrections and clear explanations
            6. Vocabulary mistakes and collocations
            7. More natural native-speaker expressions that could replace learner sentences
            8. 3-5 useful vocabulary words relevant to this scenario
            9. Alternative sentences to help improve fluency
            
            Format as structured JSON.
            """;

    public static String build(String language, String level, String userRole, String aiRole, String fullDialogue) {
        return PromptBuilder.create()
                .template(TEMPLATE)
                .variable("language", language)
                .variable("level", level)
                .variable("userRole", userRole)
                .variable("aiRole", aiRole)
                .variable("fullDialogue", fullDialogue)
                .build();
    }
}
