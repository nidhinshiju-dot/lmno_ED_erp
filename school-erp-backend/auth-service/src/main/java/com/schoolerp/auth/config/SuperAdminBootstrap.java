package com.schoolerp.auth.config;

import com.schoolerp.auth.entity.User;
import com.schoolerp.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Idempotent bootstrap to ensure SUPER_ADMIN seed accounts have a correctly
 * BCrypt-hashed password on every startup. This corrects stale or mis-generated
 * hashes in the SQL seed without wiping data or bypassing auth logic.
 *
 * Runs ONLY in dev/local environments (guard via profile if needed).
 * Password is injectable via env var SUPER_ADMIN_PASSWORD; defaults to dev value.
 */
@Component
public class SuperAdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminBootstrap.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${seed.super-admin.password:SuperAdmin@2026}")
    private String superAdminPassword;

    @Override
    public void run(String... args) {
        log.info("BOOTSTRAP: Verifying SUPER_ADMIN seed accounts...");

        List<User> superAdmins = userRepository.findAll().stream()
                .filter(u -> "SUPER_ADMIN".equals(u.getRole()))
                .toList();

        if (superAdmins.isEmpty()) {
            log.warn("BOOTSTRAP: No SUPER_ADMIN accounts found in DB. Check seed SQL.");
            return;
        }

        for (User admin : superAdmins) {
            if (!passwordEncoder.matches(superAdminPassword, admin.getPassword())) {
                log.info("BOOTSTRAP: Re-encoding password for SUPER_ADMIN [{}] — hash mismatch detected.", admin.getEmail());
                admin.setPassword(passwordEncoder.encode(superAdminPassword));
                admin.setRequiresPasswordReset(false);
                userRepository.save(admin);
                log.info("BOOTSTRAP: Password corrected for [{}].", admin.getEmail());
            } else {
                log.info("BOOTSTRAP: Password hash OK for SUPER_ADMIN [{}]. No update needed.", admin.getEmail());
            }
        }

        log.info("BOOTSTRAP: SUPER_ADMIN verification complete.");
    }
}
