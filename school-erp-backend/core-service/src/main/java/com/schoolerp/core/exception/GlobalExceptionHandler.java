package com.schoolerp.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        String rootMsg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        
        if (rootMsg != null && rootMsg.toLowerCase().contains("duplicate") || 
            (rootMsg != null && rootMsg.toLowerCase().contains("unique"))) {
            // Unique constraint violation on INSERT or UPDATE
            if (rootMsg.toLowerCase().contains("phone")) {
                error.put("error", "A staff member with this phone number already exists. Please use a different phone number.");
            } else if (rootMsg.toLowerCase().contains("email")) {
                error.put("error", "A staff member with this email already exists. Please use a different email.");
            } else {
                error.put("error", "A duplicate record already exists. Please check phone number, email, or other unique fields.");
            }
        } else {
            error.put("error", "Cannot delete this record because it is referenced by other records in the system.");
        }
        error.put("details", rootMsg);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(DependencyConflictException.class)
    public ResponseEntity<Map<String, String>> handleDependencyConflictException(DependencyConflictException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Dependency Conflict");
        error.put("details", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}
