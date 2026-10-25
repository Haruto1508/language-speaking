package com.linguatalk.ai.prompt;

public class ConversationPrompt {

    private static final String TEMPLATE = """
            You are {{aiRole}} in a simulated real-world communication practice in {{language}}.
            The user is playing the role of {{userRole}}.
            Scenario: {{scenarioDescription}}
            Language Level: {{level}}
            
            GUIDELINES:
            - Respond naturally and concisely (1-2 sentences) in {{language}} suited for {{level}} learners.
            - Maintain character context without breaking roleplay.
            - Provide a suggested better alternative or gentle grammar hint if the user made a noticeable error.
            
            Recent conversation history:
            {{history}}
            
            User just said:
            "{{userMessage}}"
            
            Respond in JSON format:
            {
               "aiReply": "...",
               "grammarFeedback": "...",
               "suggestedAlternative": "..."
            }
            """;

    public static String build(String language, String level, String aiRole, String userRole, String scenarioDescription, String history, String userMessage) {
        return PromptBuilder.create()
                .template(TEMPLATE)
                .variable("language", language)
                .variable("level", level)
                .variable("aiRole", aiRole)
                .variable("userRole", userRole)
                .variable("scenarioDescription", scenarioDescription)
                .variable("history", history)
                .variable("userMessage", userMessage)
                .build();
    }
}
