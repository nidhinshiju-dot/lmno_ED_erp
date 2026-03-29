package com.schoolerp.core.service;

import com.schoolerp.core.dto.SchoolCreationResponse;
import com.schoolerp.core.entity.School;
import com.schoolerp.core.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository repository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final CredentialsService credentialsService;
    
    @org.springframework.beans.factory.annotation.Value("${AUTH_SERVICE_URL:http://auth-service:8081}")
    private String authServiceUrl;

    public List<School> getAllSchools() {
        return repository.findAll();
    }

    public java.util.Optional<School> getById(String id) {
        return repository.findById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public SchoolCreationResponse createSchool(School school) {
        School savedSchool = repository.save(school);
        
        String tenantId = savedSchool.getId();
        
        try {
            // 1. Create the new schema
            jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + tenantId);
            
            // 2. Execute the table creation script in the new schema
            org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("tenant-init.sql");
            org.springframework.jdbc.datasource.init.ResourceDatabasePopulator populator = new org.springframework.jdbc.datasource.init.ResourceDatabasePopulator(resource);
            
            // Set search path first so tables are created in the right schema
            jdbcTemplate.execute("SET search_path TO " + tenantId);
            populator.execute(jdbcTemplate.getDataSource());
            
            if (school.isIncludeDefaultSubjects()) {
                String insertSubjects = "INSERT INTO subjects (id, name, code, status) VALUES " +
                    "(gen_random_uuid()::text, 'Mathematics', 'MATH', 'ACTIVE'), " +
                    "(gen_random_uuid()::text, 'Science', 'SCI', 'ACTIVE'), " +
                    "(gen_random_uuid()::text, 'Social Studies', 'SST', 'ACTIVE'), " +
                    "(gen_random_uuid()::text, 'English', 'ENG', 'ACTIVE'), " +
                    "(gen_random_uuid()::text, 'Hindi', 'HIN', 'ACTIVE'), " +
                    "(gen_random_uuid()::text, 'Computer Science', 'CS', 'ACTIVE')";
                jdbcTemplate.execute(insertSubjects);
            }
            
            jdbcTemplate.execute("SET search_path TO public"); // Reset
            
            // 3. Provision the Admin User in Auth Service Asynchronously
            credentialsService.createSchoolAdminCredential(savedSchool);
            
            // Return indicating that provisioning is async
            return new SchoolCreationResponse(savedSchool, school.getContactEmail(), "Pending Async Provisioning (Check Admin Email)");
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to provision tenant database: " + e.getMessage(), e);
        }
    }
    
    public School toggleStatus(String id) {
        School school = repository.findById(id).orElseThrow(() -> new RuntimeException("School not found"));
        school.setActive(!school.isActive());
        return repository.save(school);
    }
}
