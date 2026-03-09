package com.schoolerp.lms.service.ai.tools;

import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import java.util.Map;

public interface AiTool {
    
    /**
     * @return The Anthropic Tool schema definition used to instruct Claude.
     */
    AnthropicRequest.Tool getToolSchema();

    /**
     * Extracts parameters from the tool call and executes the backend logic.
     * @param input the parameters passed by Claude.
     * @return String JSON representation of the backend data.
     */
    String execute(Map<String, Object> input);

    /**
     * @return true if this tool is allowed for the given persona/role.
     */
    boolean isAllowedForRole(String role);
}
