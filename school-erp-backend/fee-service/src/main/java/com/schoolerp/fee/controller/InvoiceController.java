package com.schoolerp.fee.controller;

import com.schoolerp.fee.entity.Invoice;
import com.schoolerp.fee.entity.Payment;
import com.schoolerp.fee.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable("id") String id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Invoice createInvoice(@Valid @RequestBody Invoice invoice) {
        return invoiceService.createInvoice(invoice);
    }

    @PostMapping("/{id}/pay")
    public Payment recordPayment(@PathVariable("id") String invoiceId, @Valid @RequestBody Payment payment) {
        return invoiceService.recordPayment(invoiceId, payment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody Object body) {
        return ResponseEntity.ok().build();
    }
}
