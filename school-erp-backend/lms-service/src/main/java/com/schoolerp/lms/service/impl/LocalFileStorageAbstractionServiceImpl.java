package com.schoolerp.lms.service.impl;

import com.schoolerp.lms.service.StorageAbstractionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalFileStorageAbstractionServiceImpl implements StorageAbstractionService {

    @Value("${file.storage.location:/tmp/lmno-uploads}")
    private String storageLocation;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(storageLocation).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String upload(MultipartFile file, String pathPrefix) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf");
        String fileName = pathPrefix + "-" + UUID.randomUUID().toString() + "-" + originalFileName;

        if (fileName.contains("..")) {
            throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
        }

        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return fileName; // Return the identifier
    }

    @Override
    public String getDownloadUrl(String fileIdentifier) {
        // Return a mock download URL for the local abstraction
        try {
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/v1/files/download/")
                    .path(fileIdentifier)
                    .toUriString();
        } catch (Exception e) {
            // Fallback for execution outside of a web request context
            return "/api/v1/files/download/" + fileIdentifier;
        }
    }

    @Override
    public void delete(String fileIdentifier) {
        if (fileIdentifier != null && !fileIdentifier.trim().isEmpty()) {
            try {
                Path filePath = this.fileStorageLocation.resolve(fileIdentifier).normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Failed to delete file " + fileIdentifier + ": " + e.getMessage());
            }
        }
    }

    @Override
    public String replace(MultipartFile file, String oldFileIdentifier, String newPathPrefix) throws IOException {
        String newIdentifier = upload(file, newPathPrefix);
        if (oldFileIdentifier != null) {
            delete(oldFileIdentifier);
        }
        return newIdentifier;
    }
}
