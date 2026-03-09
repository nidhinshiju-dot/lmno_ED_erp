package com.schoolerp.lms.service.ai.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.config.tenant.TenantContext;
import com.schoolerp.lms.dto.ai.anthropic.AnthropicRequest;
import com.schoolerp.lms.entity.ai.AiInvoice;
import com.schoolerp.lms.repository.ai.AiInvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GetPendingFeesTool implements AiTool {

    private final AiInvoiceRepository invoiceRepository;
    private final ObjectMapper objectMapper;

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
        
        List<AiInvoice> pendingInvoices;
        
        // Super admin bypasses tenant context in its special query
        if ("super_admin_tenant".equals(TenantContext.getCurrentTenant())) {
             pendingInvoices = invoiceRepository.findAllByStatusCrossTenant("PENDING");
             List<AiInvoice> overdue = invoiceRepository.findAllByStatusCrossTenant("OVERDUE");
             pendingInvoices.addAll(overdue);
        } else {
             pendingInvoices = invoiceRepository.findByStatus("PENDING");
             List<AiInvoice> overdue = invoiceRepository.findByStatus("OVERDUE");
             pendingInvoices.addAll(overdue);
        }

        try {
            return objectMapper.writeValueAsString(pendingInvoices);
        } catch (Exception e) {
            log.error("Error serializing pending invoices", e);
            return "{\"error\": \"Failed to retrieve pending fees.\"}";
        }
    }

    @Override
    public boolean isAllowedForRole(String role) {
        // Only Admins and Super Admins should see financial data
        return List.of("SUPER_ADMIN", "ADMIN").contains(role.toUpperCase());
    }
}
