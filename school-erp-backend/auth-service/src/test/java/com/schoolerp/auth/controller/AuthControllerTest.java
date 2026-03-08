package com.schoolerp.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolerp.auth.config.JwtUtil;
import com.schoolerp.auth.config.SecurityConfig;
import com.schoolerp.auth.entity.User;
import com.schoolerp.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class) // Need security config to allow endpoints
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    public void testSuccessfulLogin() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@school.com");
        req.setPassword("password123");

        when(authService.loginUser("test@school.com", "password123")).thenReturn("mock-jwt-token");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));
    }

    @Test
    public void testFailedLogin() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("wrong@school.com");
        req.setPassword("badpass");

        when(authService.loginUser("wrong@school.com", "badpass"))
                .thenThrow(new RuntimeException("Invalid credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid credentials"));
    }

    @Test
    public void testSuccessfulRegistration() throws Exception {
        User reqUser = new User();
        reqUser.setEmail("new@school.com");
        reqUser.setPassword("pass");
        reqUser.setRole("TEACHER");
        reqUser.setTenantId("T1");

        User savedUser = new User();
        savedUser.setId("usr-123");
        savedUser.setEmail("new@school.com");

        when(authService.registerUser(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("usr-123"))
                .andExpect(jsonPath("$.email").value("new@school.com"));
    }
}
