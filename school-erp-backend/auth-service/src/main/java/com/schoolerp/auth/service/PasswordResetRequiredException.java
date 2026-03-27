package com.schoolerp.auth.service;

public class PasswordResetRequiredException extends RuntimeException {
    public PasswordResetRequiredException(String message) {
        super(message);
    }
}
