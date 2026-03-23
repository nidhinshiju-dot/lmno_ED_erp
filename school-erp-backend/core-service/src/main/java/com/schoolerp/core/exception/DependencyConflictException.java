package com.schoolerp.core.exception;

public class DependencyConflictException extends RuntimeException {
    public DependencyConflictException(String message) {
        super(message);
    }
}
