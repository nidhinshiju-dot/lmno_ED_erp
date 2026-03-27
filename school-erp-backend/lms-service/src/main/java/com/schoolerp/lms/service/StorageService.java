package com.schoolerp.lms.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {
    String storeFile(MultipartFile file, String prefix) throws IOException;
    Resource loadFile(String fileUrl) throws IOException;
    void deleteFile(String fileUrl);
}
