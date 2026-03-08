package com.schoolerp.fee.controller;

import com.schoolerp.fee.entity.FeeStructure;
import com.schoolerp.fee.service.FeeStructureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FeeStructureController.class)
public class FeeStructureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FeeStructureService feeStructureService;

    private FeeStructure mockFee;

    @BeforeEach
    void setup() {
        mockFee = new FeeStructure();
        mockFee.setId("fee-1");
        mockFee.setName("Tuition Q1");
        mockFee.setAmount(new BigDecimal("15000.00"));
        mockFee.setDueDate(LocalDate.of(2026, 4, 30));
        mockFee.setAcademicYear("2025-2026");
        mockFee.setClassId("class-10");
        mockFee.setDescription("First quarter tuition fee");
    }

    @Test
    void testGetAllFees() throws Exception {
        when(feeStructureService.getAllFeeStructures()).thenReturn(List.of(mockFee));

        mockMvc.perform(get("/api/v1/fees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("fee-1"))
                .andExpect(jsonPath("$[0].name").value("Tuition Q1"))
                .andExpect(jsonPath("$[0].amount").value(15000.00));
    }

    @Test
    void testGetFeeByIdFound() throws Exception {
        when(feeStructureService.getFeeStructureById("fee-1")).thenReturn(Optional.of(mockFee));

        mockMvc.perform(get("/api/v1/fees/fee-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Tuition Q1"));
    }

    @Test
    void testGetFeeByIdNotFound() throws Exception {
        when(feeStructureService.getFeeStructureById("unknown")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/fees/unknown"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateFee() throws Exception {
        when(feeStructureService.createFeeStructure(org.mockito.ArgumentMatchers.any(FeeStructure.class)))
                .thenReturn(mockFee);

        mockMvc.perform(post("/api/v1/fees")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Tuition Q1\",\"amount\":15000.00,\"academicYear\":\"2025-2026\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Tuition Q1"));
    }
}
