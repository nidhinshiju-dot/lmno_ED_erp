package com.schoolerp.fee.service;

import com.schoolerp.fee.entity.Invoice;
import com.schoolerp.fee.entity.Payment;
import com.schoolerp.fee.repository.InvoiceRepository;
import com.schoolerp.fee.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> getInvoiceById(String id) {
        return invoiceRepository.findById(id);
    }

    public List<Invoice> getInvoicesByStudent(String studentId) {
        return invoiceRepository.findByStudentId(studentId);
    }

    public List<Invoice> getInvoicesByStatus(Invoice.InvoiceStatus status) {
        return invoiceRepository.findByStatus(status);
    }

    public Invoice createInvoice(Invoice invoice) {
        invoice.setIssuedDate(LocalDate.now());
        invoice.setStatus(Invoice.InvoiceStatus.PENDING);
        return invoiceRepository.save(invoice);
    }

    public Payment recordPayment(String invoiceId, Payment payment) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        payment.setInvoiceId(invoiceId);
        payment.setPaidAt(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);

        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setPaidDate(LocalDate.now());
        invoiceRepository.save(invoice);

        return savedPayment;
    }
}
