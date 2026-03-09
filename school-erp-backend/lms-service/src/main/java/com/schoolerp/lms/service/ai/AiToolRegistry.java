package com.schoolerp.lms.service.ai;

import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.service.ai.tools.AiTool;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiToolRegistry {

    private final List<AiTool> allTools;

    public List<AnthropicRequest.Tool> getToolsForRole(String role) {
        return allTools.stream()
                .filter(tool -> tool.isAllowedForRole(role))
                .map(AiTool::getToolSchema)
                .collect(Collectors.toList());
    }

    public AiTool getToolByName(String name) {
        return allTools.stream()
                .filter(tool -> tool.getToolSchema().getName().equals(name))
                .findFirst()
                .orElse(null);
    }
}
