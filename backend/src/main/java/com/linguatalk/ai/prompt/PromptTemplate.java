package com.linguatalk.ai.prompt;

import java.util.Map;

public class PromptTemplate {
    private final String template;

    public PromptTemplate(String template) {
        this.template = template;
    }

    public String render(Map<String, Object> variables) {
        String result = this.template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String val = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replace(placeholder, val);
        }
        return result;
    }
}
