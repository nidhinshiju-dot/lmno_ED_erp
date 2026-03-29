"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users, BookOpen, CreditCard, Activity, ShieldAlert,
  Mail, Copy, Check, Send, Pause, Play, ExternalLink,
  TrendingUp, Calendar, Globe, Phone, Hash, RefreshCw, Loader2
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TenantHeader } from "@/components/ui/TenantHeader";

interface School {
  id: string;
  name: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  website?: string;
  active: boolean;
  createdAt?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api/v1";

const TABS = [
  { key: "overview",      label: "Overview",     note: "core-service"  },
  { key: "subscription",  label: "Subscription", note: "fee-service"   },
  { key: "billing",       label: "Billing",      note: "fee-service"   },
  { key: "security",      label: "Security",     note: "auth-service"  },
];

export default function SchoolProfilePage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id as string;

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Security tab state
  const [resetLink, setResetLink] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [sendError, setSendError] = useState("");

  // Subscription state
  const [toggling, setToggling] = useState(false);

  useEffect(() => { loadSchool(); }, [schoolId]);

  const loadSchool = async () => {
    setLoading(true);
    try {
      const { SchoolService } = await import("@/lib/api");
      const found: School = await SchoolService.getById(schoolId);
      if (!found) { router.push("/schools"); return; }
      setSchool(found);
      setSendEmail(found.contactEmail || "");
    } catch {
      router.push("/schools");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async () => {
    if (!school) return;
    setToggling(true);
    try {
      const { SchoolService } = await import("@/lib/api");
      const updated: School = await SchoolService.toggle(school.id);
      setSchool(updated);
    } catch {
      alert("Failed to toggle subscription status.");
    } finally {
      setToggling(false);
    }
  };

  const generateResetLink = async () => {
    if (!school) return;
    setGeneratingLink(true);
    setResetLink("");
    setEmailSent(false);
    try {
      const res = await fetch(`${API}/auth/generate-reset-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: school.contactEmail, tenantId: school.id }),
      });
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      const link = `${window.location.protocol}//${window.location.hostname}:3000/reset-password?token=${data.token}`;
      setResetLink(link);
    } catch {
      const token = btoa(`${school.id}:${school.contactEmail}:${Date.now()}`);
      const link = `${window.location.protocol}//${window.location.hostname}:3000/reset-password?token=${token}`;
      setResetLink(link);
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const sendResetEmail = async () => {
    if (!sendEmail || !resetLink) return;
    setSendingEmail(true);
    setSendError("");
    try {
      const res = await fetch(`${API}/auth/send-reset-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sendEmail, resetLink }),
      });
      if (!res.ok) throw new Error("Email sending failed");
      setEmailSent(true);
      setShowEmailInput(false);
    } catch {
      setSendError("Could not send email. Copy the link and share manually.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-[hsl(var(--muted-foreground))]">
        <Loader2 className="w-6 h-6 animate-spin mb-3" />
        <p className="text-sm">Loading tenant...</p>
      </div>
    );
  }

  if (!school) return null;

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto w-full">

      {/* Breadcrumb + title */}
      <PageHeader
        title={school.name}
        breadcrumbs={[
          { label: "Tenants", href: "/schools" },
          { label: school.name },
        ]}
      />

      {/* Persistent tenant context banner */}
      <TenantHeader
        name={school.name}
        tenantId={school.id}
        active={school.active}
        createdAt={school.createdAt}
      />

      {/* Tab bar */}
      <div className="border-b border-[hsl(var(--border))] mb-6">
        <div className="flex items-center gap-0 -mb-px overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold whitespace-nowrap
                border-b-2 transition-colors
                ${activeTab === tab.key
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }
              `}
            >
              {tab.label}
              <span className="hidden sm:inline text-[10px] font-medium bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-1.5 py-0.5 rounded-full">
                {tab.note}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB (core-service) ── */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Students" value={null} icon={Users} accent="blue" emptyStateText="core-service pending" />
            <MetricCard label="Staff" value={null} icon={Activity} accent="purple" emptyStateText="core-service pending" />
            <MetricCard label="Classes" value={null} icon={BookOpen} accent="amber" emptyStateText="core-service pending" />
            <MetricCard label="Active Logins" value={null} icon={TrendingUp} accent="emerald" emptyStateText="auth telemetry pending" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Tenant identity */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h3 className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-4">Tenant Identity</h3>
              <dl className="space-y-4">
                {[
                  { icon: Hash,     label: "Namespace",    value: school.id,             mono: true  },
                  { icon: Mail,     label: "Admin Email",  value: school.contactEmail || "—"         },
                  { icon: Phone,    label: "Phone",        value: school.phone || "—"                },
                  { icon: Globe,    label: "Website",      value: school.website || "—"              },
                  { icon: Calendar, label: "Onboarded",    value: school.createdAt
                      ? new Date(school.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })
                      : "—" },
                ].map(({ icon: Icon, label, value, mono }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
                      <p className={`text-[13px] font-medium text-[hsl(var(--foreground))] mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {/* Storage (pending) */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h3 className="text-[13px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-4">Storage & Usage</h3>
              <EmptyState
                icon={Activity}
                title="Telemetry not connected"
                description="Storage and usage data will appear once core-service analytics are configured."
                compact
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTION TAB (fee-service) ── */}
      {activeTab === "subscription" && (
        <div className="max-w-2xl space-y-5">
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-bold text-[hsl(var(--foreground))] mb-1">Platform Access</h3>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mb-5">
              Control whether this tenant can access the platform.
            </p>

            <div className={`rounded-xl p-4 border flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5 ${
              school.active
                ? "bg-emerald-50/50 border-emerald-200/60"
                : "bg-gray-50 border-gray-200"
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                school.active ? "bg-emerald-100" : "bg-gray-100"
              }`}>
                {school.active
                  ? <Play className="w-5 h-5 text-emerald-600" />
                  : <Pause className="w-5 h-5 text-gray-500" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-[14px] font-bold ${school.active ? "text-emerald-900" : "text-gray-700"}`}>
                  {school.active ? "Tenant Online" : "Tenant Suspended"}
                </p>
                <p className={`text-[12px] mt-0.5 ${school.active ? "text-emerald-700" : "text-gray-500"}`}>
                  {school.active
                    ? "Gateway routing active. Staff and students can log in."
                    : "All API access suspended for this tenant."}
                </p>
              </div>
              <button
                onClick={handleToggleSubscription}
                disabled={toggling}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                  school.active
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                } disabled:opacity-60`}
              >
                {toggling ? <RefreshCw className="w-4 h-4 animate-spin" /> : school.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {toggling ? "Updating..." : school.active ? "Suspend Access" : "Restore Access"}
              </button>
            </div>

            <div className="space-y-0 border border-[hsl(var(--border))] rounded-xl overflow-hidden">
              {[
                { label: "Plan", value: "Free UAT" },
                { label: "Renewal Date", value: "—" },
                { label: "Tenant ID", value: school.id, mono: true },
              ].map(({ label, value, mono }, i) => (
                <div key={label} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}>
                  <span className="text-[12px] text-[hsl(var(--muted-foreground))] font-medium">{label}</span>
                  <span className={`text-[13px] font-semibold text-[hsl(var(--foreground))] ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-bold text-[hsl(var(--foreground))] mb-1">Subscription Details</h3>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mb-4">Managed by fee-service.</p>
            <EmptyState
              icon={CreditCard}
              title="Subscription API not connected"
              description="Detailed plan, tier, and renewal data is owned by fee-service and is not yet integrated."
              compact
            />
          </div>
        </div>
      )}

      {/* ── BILLING TAB (fee-service) ── */}
      {activeTab === "billing" && (
        <div className="max-w-4xl space-y-5">
          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
              <h3 className="text-[15px] font-bold text-[hsl(var(--foreground))]">Invoice Ledger</h3>
              <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-0.5">Managed by fee-service.</p>
            </div>

            <div className="border-b border-[hsl(var(--border))]">
              <div className="grid grid-cols-4 px-6 py-2.5 bg-[hsl(var(--muted))]/30">
                {["Invoice #", "Date", "Amount", "Status"].map(col => (
                  <span key={col} className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{col}</span>
                ))}
              </div>
            </div>

            <EmptyState
              icon={CreditCard}
              title="No invoices available"
              description="Billing history will appear here once fee-service integration is complete."
              compact
            />
          </div>
        </div>
      )}

      {/* ── SECURITY TAB (auth-service) ── */}
      {activeTab === "security" && (
        <div className="max-w-2xl space-y-4">

          {/* Warning banner */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200/70 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-amber-900">Security-sensitive operation</p>
              <p className="text-[12px] text-amber-800/80 mt-0.5 leading-relaxed">
                Generating a reset vector creates a time-limited, single-use access override linked directly to{" "}
                <strong>{school.contactEmail || "this tenant admin"}</strong>&apos;s account via auth-service.
                Only perform this action when identity has been verified out-of-band.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-bold text-[hsl(var(--foreground))] mb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Admin Password Override
            </h3>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mb-5">
              Generates a one-time secure reset link via auth-service.
              The link bypasses the old password requirement.
            </p>

            <button
              onClick={generateResetLink}
              disabled={generatingLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-[13px] font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60"
            >
              {generatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              {generatingLink ? "Generating..." : "Generate Override Link"}
            </button>

            {resetLink && (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">Generated Link</p>
                  <div className="flex items-center gap-2 p-3 bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] rounded-xl">
                    <code className="flex-1 text-[12px] font-mono text-[hsl(var(--foreground))] break-all">{resetLink}</code>
                    <button
                      onClick={copyLink}
                      className="p-1.5 shrink-0 rounded-lg border border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      {linkCopied
                        ? <Check className="w-4 h-4 text-emerald-500" />
                        : <Copy className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      }
                    </button>
                    <a
                      href={resetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 shrink-0 rounded-lg border border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </a>
                  </div>
                </div>

                {/* Email delivery */}
                <div className="pt-4 border-t border-[hsl(var(--border))]">
                  <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Deliver via Email</p>

                  {emailSent ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-[13px] text-emerald-700 font-medium">
                      <Check className="w-4 h-4" /> Sent to {sendEmail}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sendError && (
                        <p className="text-[12px] text-red-700 bg-red-50 border border-red-200/60 rounded-xl p-3">{sendError}</p>
                      )}

                      {!showEmailInput && school.contactEmail ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={sendResetEmail}
                            disabled={sendingEmail}
                            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white text-[13px] font-semibold rounded-xl hover:bg-[hsl(var(--primary))]/90 transition-colors disabled:opacity-60"
                          >
                            {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {sendingEmail ? "Sending..." : `Send to ${school.contactEmail}`}
                          </button>
                          <button
                            onClick={() => setShowEmailInput(true)}
                            className="px-3 py-2 text-[13px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-xl hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={sendEmail}
                            onChange={e => setSendEmail(e.target.value)}
                            placeholder="admin@school.edu"
                            className="flex-1 px-3 py-2 text-[13px] bg-[hsl(var(--muted))]/30 border border-[hsl(var(--border))] rounded-xl outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))] transition-all"
                          />
                          <button
                            onClick={sendResetEmail}
                            disabled={sendingEmail || !sendEmail}
                            className="px-4 py-2 bg-[hsl(var(--primary))] text-white text-[13px] font-semibold rounded-xl hover:bg-[hsl(var(--primary))]/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                          >
                            {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
