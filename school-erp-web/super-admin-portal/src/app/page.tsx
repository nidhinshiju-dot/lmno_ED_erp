"use client";

import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Building2, Users, CreditCard, Activity, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto w-full">

      <PageHeader
        title="Platform Overview"
        subtitle="Operational summary across the LMNO multi-tenant platform."
        actions={
          <Link
            href="/schools/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white text-sm font-semibold rounded-xl hover:bg-[hsl(var(--primary))]/90 transition-colors shadow-sm"
          >
            + Onboard Tenant
          </Link>
        }
      />

      {/* Metric row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Tenants"
          value={null}
          icon={Building2}
          accent="blue"
          emptyStateText="core-service API pending"
        />
        <MetricCard
          label="Platform Users"
          value={null}
          icon={Users}
          accent="purple"
          emptyStateText="auth-service API pending"
        />
        <MetricCard
          label="Monthly Revenue"
          value={null}
          icon={CreditCard}
          accent="emerald"
          emptyStateText="fee-service API pending"
        />
        <MetricCard
          label="System Health"
          value={null}
          icon={Activity}
          accent="amber"
          emptyStateText="No telemetry configured"
        />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h2 className="text-[14px] font-semibold text-[hsl(var(--foreground))] mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Onboard a new school", href: "/schools/new", desc: "Provision tenant & admin account" },
              { label: "Manage tenants", href: "/schools", desc: "View all active schools" },
              { label: "User management", href: "/platform-users", desc: "Platform-level identities" },
            ].map(({ label, href, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors group"
              >
                <div>
                  <p className="text-[13px] font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">{label}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{desc}</p>
                </div>
                <span className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors text-lg">›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-[14px] font-semibold text-[hsl(var(--foreground))]">Recent Platform Activity</h2>
            </div>
            <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">Event streaming pending</span>
          </div>
          <div className="p-4">
            <EmptyState
              icon={Activity}
              title="No activity recorded yet"
              description="Platform-level events will appear here once the event streaming service is connected."
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
