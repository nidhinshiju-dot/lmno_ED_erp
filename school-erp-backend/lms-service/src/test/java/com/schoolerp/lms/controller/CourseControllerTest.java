package com.schoolerp.lms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.lms.entity.Course;
import com.schoolerp.lms.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
@AutoConfigureMockMvc(addFilters = false)
public class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService courseService;

    @Test
    public void testGetAllCourses() throws Exception {
        Course c1 = new Course();
        c1.setId("c-1");
        c1.setTitle("Calculus I");

        when(courseService.getAllCourses()).thenReturn(Arrays.asList(c1));

        mockMvc.perform(get("/api/v1/courses")
                .header("X-Tenant-ID", "T1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("c-1"))
                .andExpect(jsonPath("$[0].title").value("Calculus I"));
    }

    @Test
    public void testGetCourseById() throws Exception {
        Course c1 = new Course();
        c1.setId("c-2");
        c1.setTitle("Physics");

        when(courseService.getCourseById("c-2")).thenReturn(Optional.of(c1));

        mockMvc.perform(get("/api/v1/courses/c-2")
                .header("X-Tenant-ID", "T1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("c-2"));
    }

    @Test
    public void testGetCourseByIdNotFound() throws Exception {
        when(courseService.getCourseById(anyString())).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/courses/x-999")
                .header("X-Tenant-ID", "T1"))
                .andExpect(status().isNotFound());
    }
}
