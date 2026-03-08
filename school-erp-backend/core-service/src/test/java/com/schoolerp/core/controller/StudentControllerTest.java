package com.schoolerp.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.core.entity.Student;
import com.schoolerp.core.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StudentController.class)
@AutoConfigureMockMvc(addFilters = false) // Disables global filters if not explicitly configured in slice
public class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentService studentService;

    private Student mockStudent;

    @BeforeEach
    public void setup() {
        mockStudent = new Student();
        mockStudent.setId("s-1");
        mockStudent.setName("John Doe");
        mockStudent.setAdmissionNumber("ADM-001");
        mockStudent.setDob(LocalDate.of(2010, 5, 15));
    }

    @Test
    public void testGetAllStudents() throws Exception {
        when(studentService.getAllStudents()).thenReturn(Arrays.asList(mockStudent));

        mockMvc.perform(get("/api/v1/students")
                .header("X-Tenant-ID", "tenant1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("s-1"))
                .andExpect(jsonPath("$[0].name").value("John Doe"));
    }

    @Test
    public void testGetStudentByIdFound() throws Exception {
        when(studentService.getStudentById("s-1")).thenReturn(Optional.of(mockStudent));

        mockMvc.perform(get("/api/v1/students/s-1")
                .header("X-Tenant-ID", "tenant1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("s-1"));
    }

    @Test
    public void testGetStudentByIdNotFound() throws Exception {
        when(studentService.getStudentById("s-999")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/students/s-999")
                .header("X-Tenant-ID", "tenant1"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateStudent() throws Exception {
        when(studentService.createStudent(any(Student.class))).thenReturn(mockStudent);

        mockMvc.perform(post("/api/v1/students")
                .header("X-Tenant-ID", "tenant1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockStudent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admissionNumber").value("ADM-001"));
    }
}
