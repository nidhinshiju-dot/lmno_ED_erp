package com.schoolerp.lms.interceptor;

import com.schoolerp.lms.config.tenant.TenantContext;
import com.schoolerp.lms.context.RequestContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestContextInterceptor implements HandlerInterceptor {

    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String USER_ID_HEADER = "X-User-ID";
    private static final String ROLE_HEADER = "X-User-Role";
    private static final String STAFF_ID_HEADER = "X-Staff-ID";
    private static final String STUDENT_ID_HEADER = "X-Student-ID";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Skip auth checks for swagger, etc. if needed
        String path = request.getRequestURI();
        if (path.contains("/v3/api-docs") || path.contains("/swagger-ui")) {
            return true;
        }

        String tenantId = request.getHeader(TENANT_HEADER);

        // Populate Hibernate Tenant Context
        if (tenantId != null && !tenantId.isEmpty()) {
            TenantContext.setCurrentTenant(tenantId);
        } else {
            // Strictly enforce tenant filtering: without a tenant, protected APIs cannot be accessed.
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }

        // Populate RequestContext for our application
        RequestContext context = new RequestContext();
        context.setTenantId(tenantId);
        context.setUserId(request.getHeader(USER_ID_HEADER));
        context.setUserRole(request.getHeader(ROLE_HEADER));
        context.setStaffId(request.getHeader(STAFF_ID_HEADER));
        context.setStudentId(request.getHeader(STUDENT_ID_HEADER));

        RequestContext.setContext(context);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        RequestContext.clearContext();
        TenantContext.clear();
    }
}
