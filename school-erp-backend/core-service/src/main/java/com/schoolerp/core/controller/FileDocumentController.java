package com.schoolerp.core.controller;

import com.schoolerp.core.entity.FileDocument;
import com.schoolerp.core.service.FileDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileDocumentController {

    private final FileDocumentService fileDocumentService;

    @GetMapping
    public ResponseEntity<List<FileDocument>> getAll() {
        return ResponseEntity.ok(fileDocumentService.getAll());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FileDocument>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(fileDocumentService.getByCategory(category));
    }

    @GetMapping("/reference/{referenceId}")
    public ResponseEntity<List<FileDocument>> getByReference(@PathVariable String referenceId) {
        return ResponseEntity.ok(fileDocumentService.getByReference(referenceId));
    }

    @Autowired
    private com.schoolerp.core.service.FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<FileDocument> uploadFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam("category") String category,
            @RequestParam(value = "referenceId", required = false) String referenceId,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy) {

        String fileName = fileStorageService.storeFile(file);
        
        FileDocument doc = new FileDocument();
        doc.setName(file.getOriginalFilename());
        doc.setFilePath("/api/v1/files/download/" + fileName);
        doc.setFileType(type);
        doc.setCategory(category);
        doc.setReferenceId(referenceId);
        doc.setUploadedBy(uploadedBy);
        doc.setFileSize(file.getSize());

        return ResponseEntity.ok(fileDocumentService.create(doc));
    }

    @PostMapping
    public ResponseEntity<FileDocument> create(@RequestBody FileDocument doc) {
        return ResponseEntity.ok(fileDocumentService.create(doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        fileDocumentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
