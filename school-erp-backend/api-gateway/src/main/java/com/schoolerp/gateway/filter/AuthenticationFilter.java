package com.schoolerp.gateway.filter;

import com.schoolerp.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            if (isSecured(exchange)) {
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    // Validate JWT token
                    jwtUtil.validateToken(authHeader);

                    // Extract claims to pass downstream
                    Claims claims = jwtUtil.getClaims(authHeader);
                    String tenantId = claims.get("tenantId", String.class);
                    String role = claims.get("role", String.class);
                    String staffId = claims.get("staffId", String.class);
                    String studentId = claims.get("studentId", String.class);
                    String userId = claims.getSubject();

                    // Mutate request to SECURELY strip forged client headers and add trusted identity for downstream microservices
                    exchange.getRequest().mutate()
                            .headers(headers -> {
                                headers.remove("X-Tenant-ID");
                                headers.remove("X-User-ID");
                                headers.remove("X-User-Role");
                                headers.remove("X-Staff-ID");
                                headers.remove("X-Student-ID");
                                headers.set("X-Tenant-ID", tenantId != null ? tenantId : "public");
                                headers.set("X-User-ID", userId);
                                headers.set("X-User-Role", role != null ? role : "UNKNOWN");
                                if (staffId != null) {
                                    headers.set("X-Staff-ID", staffId);
                                }
                                if (studentId != null) {
                                    headers.set("X-Student-ID", studentId);
                                }
                            })
                            .build();

                } catch (Exception e) {
                    System.out.println("Invalid access... " + e.getMessage());
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            }
            return chain.filter(exchange);
        });
    }

    private boolean isSecured(ServerWebExchange exchange) {
        String path = exchange.getRequest().getURI().getPath();
        if (path.equals("/api/v1/auth/login") || 
            path.equals("/api/v1/auth/reset-password") || 
            path.equals("/api/v1/auth/reset-password-by-token") ||
            path.startsWith("/api/v1/auth/health")) {
            return false;
        }
        return true;
    }

    public static class Config {
        // configuration properties if needed
    }
}
