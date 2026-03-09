package com.schoolerp.lms.repository.ai;

import com.schoolerp.lms.entity.ai.AiInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AiInvoiceRepository extends JpaRepository<AiInvoice, String> {

    @Query("SELECT i FROM AiInvoice i WHERE i.status = :status")
    List<AiInvoice> findByStatus(@Param("status") String status);
    
    @Query("SELECT i FROM AiInvoice i WHERE i.studentId = :studentId AND i.status = :status")
    List<AiInvoice> findByStudentIdAndStatus(@Param("studentId") String studentId, @Param("status") String status);
    
    // For Super Admin bypass query
    @Query(value = "SELECT * FROM invoices WHERE status = :status", nativeQuery = true)
    List<AiInvoice> findAllByStatusCrossTenant(@Param("status") String status);
}
