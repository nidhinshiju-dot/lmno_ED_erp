"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Building2, ArrowLeft, Users, BookOpen, CreditCard, Activity,
    ShieldAlert, Mail, Copy, Check, Send, Pause, Play, ExternalLink,
    TrendingUp, Calendar, Globe, Phone, Hash, RefreshCw, LogOut
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

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

const API = process.env.NEXT_PUBLIC_API_URL || "https://api-gateway-249177610154.asia-south1.run.app/api/v1";

export default function SchoolProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { logout } = useAuth();
    const schoolId = params.id as string;

    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Password reset state
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

    // Mock stats — in production these would come from an analytics endpoint
    const stats = {
        totalStudents: 0,
        totalStaff: 0,
        totalClasses: 0,
        storageUsedMB: 12,
        storageCapacityMB: 5120,
        activeLogins: 0,
        lastActivity: school?.createdAt ? new Date(school.createdAt).toLocaleDateString("en-IN") : "—",
    };

    useEffect(() => {
        loadSchool();
    }, [schoolId]);

    const loadSchool = async () => {
        setLoading(true);
        try {
            // Import SchoolService from @/lib/api dynamically or use it directly if imported
            const { SchoolService } = await import("@/lib/api");
            const all: School[] = await SchoolService.getAll();
            const found = all.find(s => s.id === schoolId);
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
            // Generate a secure token via the auth service
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
            // Fallback: generate a client-side token for demo
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
            <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading school profile...</p>
                </div>
            </div>
        );
    }

    if (!school) return null;

    const storagePercent = Math.round((stats.storageUsedMB / stats.storageCapacityMB) * 100);
    const tabs = ["overview", "subscription", "billing", "reset-password"];

    return (
        <div className="flex h-screen bg-[hsl(var(--background))]">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col bg-white border-r border-[hsl(var(--border))]">
                <div className="h-16 flex items-center px-4 border-b border-[hsl(var(--border))]">
                    <h1 className="text-xl font-bold text-[hsl(var(--primary))]">Platform Admin</h1>
                </div>
                <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
                    <Link href="/schools" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Schools
                    </Link>
                    <Link href="/schools" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-medium">
                        <Building2 className="w-5 h-5" /> {school.name}
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-[hsl(var(--border))] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-[hsl(var(--primary))]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold leading-tight">{school.name}</h2>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Tenant: <span className="font-mono">{school.id}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${school.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {school.active ? "Active" : "Paused"}
                        </span>
                        <button onClick={logout} className="p-2 flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="bg-white border-b border-[hsl(var(--border))] px-6 shrink-0">
                    <div className="flex gap-0">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                                    activeTab === tab
                                        ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                                        : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                }`}
                            >
                                {tab === "reset-password" ? "Password Reset" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 lg:p-8">

                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === "overview" && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Stats row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Students", value: stats.totalStudents, icon: Users, color: "text-blue-600 bg-blue-50" },
                                    { label: "Staff", value: stats.totalStaff, icon: Activity, color: "text-purple-600 bg-purple-50" },
                                    { label: "Classes", value: stats.totalClasses, icon: BookOpen, color: "text-amber-600 bg-amber-50" },
                                    { label: "Active Logins", value: stats.activeLogins, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="bg-white border border-[hsl(var(--border))] rounded-2xl p-5 shadow-sm">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-2xl font-bold">{value}</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* School Details */}
                            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-[hsl(var(--primary))]" /> School Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { icon: Hash, label: "Tenant ID", value: school.id, mono: true },
                                        { icon: Mail, label: "Contact Email", value: school.contactEmail || "—" },
                                        { icon: Phone, label: "Phone", value: school.phone || "—" },
                                        { icon: Globe, label: "Website", value: school.website || "—" },
                                        { icon: Calendar, label: "Joined", value: school.createdAt ? new Date(school.createdAt).toLocaleDateString("en-IN") : "—" },
                                        { icon: Activity, label: "Last Activity", value: stats.lastActivity },
                                    ].map(({ icon: Icon, label, value, mono }) => (
                                        <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/40">
                                            <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
                                                <p className={`text-sm font-medium mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Storage Usage */}
                            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[hsl(var(--primary))]" /> Storage Usage
                                </h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{stats.storageUsedMB} MB used of {stats.storageCapacityMB} MB</span>
                                    <span className="text-sm font-semibold">{storagePercent}%</span>
                                </div>
                                <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${storagePercent > 80 ? "bg-red-500" : storagePercent > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${storagePercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SUBSCRIPTION TAB ── */}
                    {activeTab === "subscription" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-base mb-1">Subscription Status</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Control whether this school can access the platform.</p>

                                <div className={`flex items-center gap-4 p-4 rounded-xl border ${school.active ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${school.active ? "bg-emerald-100" : "bg-red-100"}`}>
                                        {school.active ? <Play className="w-6 h-6 text-emerald-600" /> : <Pause className="w-6 h-6 text-red-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-semibold ${school.active ? "text-emerald-800" : "text-red-700"}`}>
                                            {school.active ? "Subscription Active" : "Subscription Paused"}
                                        </p>
                                        <p className={`text-sm ${school.active ? "text-emerald-600" : "text-red-500"}`}>
                                            {school.active ? "School staff and students can log in normally." : "All access is suspended for this school."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleToggleSubscription}
                                        disabled={toggling}
                                        className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                                            school.active
                                                ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
                                        }`}
                                    >
                                        {toggling ? <RefreshCw className="w-4 h-4 animate-spin" /> : school.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        {toggling ? "Updating..." : school.active ? "Pause Subscription" : "Resume Subscription"}
                                    </button>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border))]">
                                        <span className="text-[hsl(var(--muted-foreground))]">Plan</span>
                                        <span className="font-medium">Free UAT</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-[hsl(var(--border))]">
                                        <span className="text-[hsl(var(--muted-foreground))]">Renewal Date</span>
                                        <span className="font-medium">—</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-[hsl(var(--muted-foreground))]">Tenant ID</span>
                                        <span className="font-mono text-xs font-medium">{school.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BILLING TAB ── */}
                    {activeTab === "billing" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[hsl(var(--primary))]" /> Billing Overview
                                </h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Current billing and invoice information for this school.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: "Current Plan", value: "Free UAT" },
                                        { label: "Monthly Cost", value: "₹0" },
                                        { label: "Next Invoice", value: "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="p-4 bg-[hsl(var(--muted))]/40 rounded-xl text-center">
                                            <p className="text-lg font-bold">{value}</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                                    <div className="bg-[hsl(var(--muted))]/50 grid grid-cols-4 px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                                        <span>Invoice #</span><span>Date</span><span>Amount</span><span>Status</span>
                                    </div>
                                    <div className="px-4 py-5 text-sm text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))] text-center">
                                        No invoices yet.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PASSWORD RESET TAB ── */}
                    {activeTab === "reset-password" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Admin Password Reset
                                </h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
                                    Generate a one-time password reset link for <strong>{school.contactEmail || "the school admin"}</strong>. The link will not ask for the old password.
                                </p>

                                {/* Generate Button */}
                                <button
                                    onClick={generateResetLink}
                                    disabled={generatingLink}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[hsl(var(--primary))] text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-60"
                                >
                                    {generatingLink ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                    {generatingLink ? "Generating Link..." : "Generate Password Reset Link"}
                                </button>

                                {/* Link display */}
                                {resetLink && (
                                    <div className="mt-5 space-y-4">
                                        <div className="flex items-center gap-2 p-3 bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] rounded-xl">
                                            <span className="flex-1 text-xs font-mono text-[hsl(var(--muted-foreground))] truncate">{resetLink}</span>
                                            <button
                                                onClick={copyLink}
                                                title="Copy link"
                                                className="shrink-0 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                                            >
                                                {linkCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
                                            </button>
                                            <a href={resetLink} target="_blank" rel="noopener noreferrer" title="Open link" className="shrink-0 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
                                                <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                            </a>
                                        </div>

                                        {/* Email send section */}
                                        {emailSent ? (
                                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                                                <Check className="w-4 h-4" /> Reset link sent to <strong>{sendEmail}</strong>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {sendError && (
                                                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{sendError}</p>
                                                )}

                                                {!showEmailInput && school.contactEmail ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={sendResetEmail}
                                                            disabled={sendingEmail}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-all disabled:opacity-60"
                                                        >
                                                            {sendingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                            {sendingEmail ? "Sending..." : `Send to ${school.contactEmail}`}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowEmailInput(true)}
                                                            className="px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
                                                            title="Send to different email"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium flex items-center gap-1">
                                                            <Mail className="w-4 h-4" /> Send reset link to email
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="email"
                                                                value={sendEmail}
                                                                onChange={e => setSendEmail(e.target.value)}
                                                                placeholder="admin@school.edu"
                                                                className="flex-1 px-4 py-2.5 bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                            />
                                                            <button
                                                                onClick={sendResetEmail}
                                                                disabled={sendingEmail || !sendEmail}
                                                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center gap-2"
                                                            >
                                                                {sendingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                                Send
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            ⚠ This link allows setting a new password without knowing the old one. Share only with the verified admin.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
