package com.schoolerp.fee.controller;

import com.schoolerp.fee.entity.Invoice;
import com.schoolerp.fee.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
public class InternalAiController {

    private final InvoiceRepository invoiceRepository;

    @Value("${internal.auth.secret:backend-internal-trust-key}")
    private String expectedAuthSecret;

    private boolean isTrusted(String token) {
        return expectedAuthSecret.equals(token);
    }

    @GetMapping("/invoices/student/{studentId}/risk/financial")
    public ResponseEntity<?> getFinancialRiskSummary(
            @PathVariable String studentId,
            @RequestHeader(value = "X-Service-Auth", required = false) String authHeader) {
        
        if (!isTrusted(authHeader)) {
            return ResponseEntity.status(403).body("Invalid Service Trust Key");
        }

        long pendingFeeCount = invoiceRepository.findByStudentIdAndStatus(studentId, Invoice.InvoiceStatus.PENDING).size();
        long overdueFeeCount = invoiceRepository.findByStudentIdAndStatus(studentId, Invoice.InvoiceStatus.OVERDUE).size();
        
        double feePendingScore = Math.min(100.0, (pendingFeeCount * 25.0) + (overdueFeeCount * 50.0));

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", studentId);
        response.put("pendingInvoices", pendingFeeCount);
        response.put("overdueInvoices", overdueFeeCount);
        response.put("feeRiskScore", feePendingScore);
        
        return ResponseEntity.ok(response);
    }
}
