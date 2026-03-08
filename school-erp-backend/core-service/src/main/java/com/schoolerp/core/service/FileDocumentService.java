package com.schoolerp.core.service;

import com.schoolerp.core.entity.FileDocument;
import com.schoolerp.core.repository.FileDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FileDocumentService {

    private final FileDocumentRepository repository;

    public List<FileDocument> getAll() {
        return repository.findAll();
    }

    public List<FileDocument> getByCategory(String category) {
        return repository.findByCategoryOrderByUploadedAtDesc(category);
    }

    public List<FileDocument> getByReference(String referenceId) {
        return repository.findByReferenceIdOrderByUploadedAtDesc(referenceId);
    }

    public FileDocument create(FileDocument doc) {
        return repository.save(doc);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
