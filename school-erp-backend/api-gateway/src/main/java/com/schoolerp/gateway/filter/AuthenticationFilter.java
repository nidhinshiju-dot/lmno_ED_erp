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
                    String userId = claims.getSubject();

                    // Mutate request to add headers for downstream microservices
                    exchange.getRequest().mutate()
                            .header("X-Tenant-ID", tenantId != null ? tenantId : "public")
                            .header("X-User-ID", userId)
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
        // Allow unauthenticated access to auth endpoints, swagger etc
        return !path.contains("/api/v1/auth/");
    }

    public static class Config {
        // configuration properties if needed
    }
}
