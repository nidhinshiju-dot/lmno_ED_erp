package com.schoolerp.fee.controller;

import com.schoolerp.fee.entity.FeeStructure;
import com.schoolerp.fee.service.FeeStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees")
public class FeeStructureController {

    @Autowired
    private FeeStructureService feeStructureService;

    @GetMapping
    public List<FeeStructure> getAllFees() {
        return feeStructureService.getAllFeeStructures();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeeStructure> getFeeById(@PathVariable("id") String id) {
        return feeStructureService.getFeeStructureById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FeeStructure createFee(@RequestBody FeeStructure feeStructure) {
        return feeStructureService.createFeeStructure(feeStructure);
    }
}
