"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, ShieldAlert } from "lucide-react";

export default function PlatformUsersPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
      <PageHeader
        title="Platform Users"
        subtitle="Cross-tenant platform administrators and service accounts."
        breadcrumbs={[{ label: "Users" }]}
      />

      {/* Service boundary note */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200/60 rounded-xl mb-5">
        <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-blue-900">Auth Service Dependency</p>
          <p className="text-[12px] text-blue-800/80 mt-0.5">
            Platform user management is owned exclusively by <strong>auth-service</strong>.
            A platform-facing user list endpoint must be exposed via the API gateway before this view can be populated.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Placeholder table header */}
        <div className="border-b border-[hsl(var(--border))]">
          <div className="grid grid-cols-4 px-6 py-3 bg-[hsl(var(--muted))]/30 gap-4">
            {["User", "Role", "Tenant", "Status"].map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{col}</span>
            ))}
          </div>
        </div>

        <EmptyState
          icon={Users}
          title="Platform user list unavailable"
          description="This view will show SUPER_ADMIN and service accounts once auth-service exposes a platform-scoped user endpoint via the API gateway."
        />
      </div>
    </div>
  );
}
