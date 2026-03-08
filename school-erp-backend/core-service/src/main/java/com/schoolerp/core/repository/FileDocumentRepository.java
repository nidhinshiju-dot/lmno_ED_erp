package com.schoolerp.core.repository;

import com.schoolerp.core.entity.FileDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileDocumentRepository extends JpaRepository<FileDocument, String> {
    List<FileDocument> findByCategoryOrderByUploadedAtDesc(String category);
    List<FileDocument> findByReferenceIdOrderByUploadedAtDesc(String referenceId);
}
