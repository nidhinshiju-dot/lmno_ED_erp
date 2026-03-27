package com.schoolerp.fee.repository;

import com.schoolerp.fee.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByStudentId(String studentId);
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);
    List<Invoice> findByStudentIdAndStatus(String studentId, Invoice.InvoiceStatus status);
}
