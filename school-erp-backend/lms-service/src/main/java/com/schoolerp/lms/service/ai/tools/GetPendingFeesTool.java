package com.schoolerp.lms.service.ai.tools;

import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GetPendingFeesTool implements AiTool {

    @Override
    public AnthropicRequest.Tool getToolSchema() {
        return AnthropicRequest.Tool.builder()
                .name("get_pending_fees")
                .description("Retrieves a list of all unpaid or pending fee invoices. Use this when asked about fee defaulters or pending payments.")
                .inputSchema(AnthropicRequest.InputSchema.builder()
                        .type("object")
                        .properties(Map.of())
                        .required(List.of())
                        .build())
                .build();
    }

    @Override
    public String execute(Map<String, Object> input) {
        log.info("Executing get_pending_fees tool");
        // Disabled natively because AiInvoiceRepository was detached from the current build context
        return "{\"message\": \"Fee processing is temporarily unavailable.\"}";
    }

    @Override
    public boolean isAllowedForRole(String role) {
        // Only Admins and Super Admins should see financial data
        return List.of("SUPER_ADMIN", "ADMIN").contains(role.toUpperCase());
    }
}
