package com.schoolerp.lms.service.impl;

import com.schoolerp.lms.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements StorageService {

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
    public String storeFile(MultipartFile file, String prefix) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf");
        String fileName = prefix + "-" + UUID.randomUUID().toString() + "-" + originalFileName;

        if (fileName.contains("..")) {
            throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
        }

        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return targetLocation.toString();
    }

    @Override
    public Resource loadFile(String fileUrl) throws IOException {
        try {
            Path filePath = Paths.get(fileUrl).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileUrl);
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found " + fileUrl, ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl != null && !fileUrl.isEmpty()) {
            try {
                Path filePath = Paths.get(fileUrl).toAbsolutePath().normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Failed to delete file " + fileUrl + ": " + e.getMessage());
            }
        }
    }
}
