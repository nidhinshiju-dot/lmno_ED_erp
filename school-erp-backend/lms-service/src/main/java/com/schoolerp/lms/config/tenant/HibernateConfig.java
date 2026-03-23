package com.schoolerp.lms.config.tenant;

import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class HibernateConfig implements HibernatePropertiesCustomizer {

    private final TenantConnectionProvider tenantConnectionProvider;
    private final TenantIdentifierResolver tenantIdentifierResolver;

    public HibernateConfig(TenantConnectionProvider tenantConnectionProvider, 
                           TenantIdentifierResolver tenantIdentifierResolver) {
        this.tenantConnectionProvider = tenantConnectionProvider;
        this.tenantIdentifierResolver = tenantIdentifierResolver;
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(org.hibernate.cfg.AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER, tenantConnectionProvider);
        hibernateProperties.put(org.hibernate.cfg.AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, tenantIdentifierResolver);
    }
}
