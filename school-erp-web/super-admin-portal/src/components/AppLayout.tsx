"use client";

import {
  Building2, Settings, Users, Activity, Menu, LogOut, Bot,
  CreditCard, LayoutDashboard, ChevronRight, Shield
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/",                icon: LayoutDashboard, label: "Platform Overview" },
  { href: "/schools",         icon: Building2,       label: "Tenants"           },
  { href: "/platform-users",  icon: Users,           label: "Users"             },
  { href: "/subscriptions",   icon: CreditCard,      label: "Billing"           },
  { href: "/ai-insights",     icon: Bot,             label: "AI Insights"       },
  { href: "/settings",        icon: Settings,        label: "System Settings"   },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login") return <>{children}</>;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "SA";

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "hsl(var(--background))" }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          ${collapsed ? "w-[72px]" : "w-[240px]"}
          flex flex-col h-full flex-shrink-0 z-50
          transition-all duration-200 ease-in-out
          fixed md:relative
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ background: "hsl(220 25% 10%)" }}
      >
        {/* Logo */}
        <div className={`h-[64px] flex items-center flex-shrink-0 border-b border-white/5 ${collapsed ? "justify-center px-0" : "px-5 gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-semibold text-sm leading-tight">LMNO Platform</p>
              <p className="text-white/40 text-[11px] leading-tight">Admin Console</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-all duration-150 group relative
                  ${active
                    ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                    : "text-white/55 hover:text-white hover:bg-white/8"
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-2 border-t border-white/5 flex-shrink-0">
          <div className={`flex items-center rounded-lg p-2 gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))]/20 border border-[hsl(var(--primary))]/30 flex items-center justify-center text-xs font-bold text-[hsl(var(--primary))] flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name || "Super Admin"}</p>
                <p className="text-white/40 text-[11px] truncate">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={logout}
              title="Sign out"
              className="w-full flex justify-center p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-[64px] flex-shrink-0 flex items-center justify-between px-6 bg-white border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-4">
            <button
              className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors md:flex hidden"
              onClick={() => setCollapsed(!collapsed)}
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors md:hidden flex"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {pathname === "/" ? "Platform Overview"
                  : pathname.startsWith("/schools/") ? "Tenant Detail"
                  : pathname === "/schools" ? "Tenants"
                  : pathname === "/platform-users" ? "Platform Users"
                  : pathname === "/subscriptions" ? "Billing"
                  : pathname === "/ai-insights" ? "AI Insights"
                  : pathname === "/settings" ? "System Settings"
                  : "Platform Admin"}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">LMNO Platform Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Systems Operational</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
