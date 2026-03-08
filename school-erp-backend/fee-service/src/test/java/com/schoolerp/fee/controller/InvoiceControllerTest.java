package com.schoolerp.fee.controller;

import com.schoolerp.fee.entity.Invoice;
import com.schoolerp.fee.service.InvoiceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InvoiceController.class)
public class InvoiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InvoiceService invoiceService;

    private Invoice mockInvoice;

    @BeforeEach
    void setup() {
        mockInvoice = new Invoice();
        mockInvoice.setId("inv-1");
        mockInvoice.setStudentId("student-1");
        mockInvoice.setFeeStructureId("fee-1");
        mockInvoice.setTotalAmount(new BigDecimal("15000.00"));
        mockInvoice.setStatus(Invoice.InvoiceStatus.PENDING);
        mockInvoice.setIssuedDate(LocalDate.now());
    }

    @Test
    void testGetAllInvoices() throws Exception {
        when(invoiceService.getAllInvoices()).thenReturn(List.of(mockInvoice));

        mockMvc.perform(get("/api/v1/invoices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("inv-1"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void testGetInvoiceByIdFound() throws Exception {
        when(invoiceService.getInvoiceById("inv-1")).thenReturn(Optional.of(mockInvoice));

        mockMvc.perform(get("/api/v1/invoices/inv-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value("student-1"));
    }

    @Test
    void testGetInvoiceByIdNotFound() throws Exception {
        when(invoiceService.getInvoiceById("unknown")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/invoices/unknown"))
                .andExpect(status().isNotFound());
    }
}
