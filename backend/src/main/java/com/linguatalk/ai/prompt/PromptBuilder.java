package com.linguatalk.ai.prompt;

import java.util.HashMap;
import java.util.Map;

public class PromptBuilder {
    private final Map<String, Object> variables = new HashMap<>();
    private String baseTemplate;

    public static PromptBuilder create() {
        return new PromptBuilder();
    }

    public PromptBuilder template(String template) {
        this.baseTemplate = template;
        return this;
    }

    public PromptBuilder variable(String key, Object value) {
        this.variables.put(key, value);
        return this;
    }

    public PromptBuilder variables(Map<String, Object> vars) {
        this.variables.putAll(vars);
        return this;
    }

    public String build() {
        if (baseTemplate == null) {
            throw new IllegalStateException("Template cannot be null");
        }
        return new PromptTemplate(baseTemplate).render(variables);
    }
}
