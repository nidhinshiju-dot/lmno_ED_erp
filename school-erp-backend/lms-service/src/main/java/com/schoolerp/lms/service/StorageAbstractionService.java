package com.schoolerp.lms.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageAbstractionService {
    String upload(MultipartFile file, String path) throws IOException;
    String getDownloadUrl(String fileIdentifier);
    void delete(String fileIdentifier);
    String replace(MultipartFile file, String oldFileIdentifier, String newPath) throws IOException;
}
