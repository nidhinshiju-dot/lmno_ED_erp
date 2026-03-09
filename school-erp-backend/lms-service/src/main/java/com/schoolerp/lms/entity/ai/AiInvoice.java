package com.schoolerp.lms.entity.ai;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Getter
public class AiInvoice {

    @Id
    private String id;

    @Column(name = "student_id")
    private String studentId;

    @Column(name = "fee_structure_id")
    private String feeStructureId;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    private String status;

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "tenant_id", updatable = false)
    private String tenantId;
}
