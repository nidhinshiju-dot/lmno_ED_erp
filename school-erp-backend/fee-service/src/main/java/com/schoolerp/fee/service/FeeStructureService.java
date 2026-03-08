package com.schoolerp.fee.service;

import com.schoolerp.fee.entity.FeeStructure;
import com.schoolerp.fee.repository.FeeStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeeStructureService {

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    public List<FeeStructure> getAllFeeStructures() {
        return feeStructureRepository.findAll();
    }

    public Optional<FeeStructure> getFeeStructureById(String id) {
        return feeStructureRepository.findById(id);
    }

    public FeeStructure createFeeStructure(FeeStructure feeStructure) {
        return feeStructureRepository.save(feeStructure);
    }

    public List<FeeStructure> getFeesByClass(String classId) {
        return feeStructureRepository.findByClassId(classId);
    }
}
