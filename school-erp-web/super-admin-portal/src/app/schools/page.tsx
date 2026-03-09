"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SchoolService } from "@/lib/api";
import { Building2, Plus, ToggleLeft, ToggleRight, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface School {
    id: string;
    name: string;
    contactEmail: string;
    active: boolean;
    createdAt: string;
}

export default function SchoolsPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        loadSchools();
    }, []);

    const loadSchools = async () => {
        setLoading(true);
        try {
            const data = await SchoolService.getAll();
            setSchools(data);
        } catch {
            console.error("Failed to load schools");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const updated = await SchoolService.toggle(id);
            setSchools(schools.map(s => s.id === id ? updated : s));
        } catch {
            alert("Failed to toggle status");
        }
    };

    return (
        <div className="flex h-screen bg-[hsl(var(--background))]">
            {/* Re-use inline sidebar for this page */}
            <aside className="w-64 flex flex-col bg-white border-r border-[hsl(var(--border))]">
                <div className="h-16 flex items-center px-4 border-b border-[hsl(var(--border))]">
                    <h1 className="text-xl font-bold text-[hsl(var(--primary))]">Platform Admin</h1>
                </div>
                <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link href="/schools" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-medium">
                        <Building2 className="w-5 h-5" /> Schools
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-[hsl(var(--border))]">
                    <h2 className="text-lg font-semibold">School Management</h2>
                    <div className="flex items-center gap-4">
                        <Link href="/schools/new" className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm">
                            <Plus className="w-4 h-4" /> Onboard School
                        </Link>
                        <button onClick={logout} className="p-2 flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Log Out</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 lg:p-10">
                    <div className="max-w-5xl mx-auto">
                        <p className="text-[hsl(var(--muted-foreground))] mb-6">View and manage all schools using the platform.</p>

                        <div className="bg-white border border-[hsl(var(--border))] rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[hsl(var(--muted))]/50 border-b border-[hsl(var(--border))]">
                                        <th className="p-4 font-semibold text-sm text-[hsl(var(--muted-foreground))]">School Name</th>
                                        <th className="p-4 font-semibold text-sm text-[hsl(var(--muted-foreground))]">Tenant ID</th>
                                        <th className="p-4 font-semibold text-sm text-[hsl(var(--muted-foreground))]">Contact</th>
                                        <th className="p-4 font-semibold text-sm text-[hsl(var(--muted-foreground))]">Status</th>
                                        <th className="p-4 font-semibold text-sm text-[hsl(var(--muted-foreground))]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-[hsl(var(--muted-foreground))]">Loading schools...</td>
                                        </tr>
                                    ) : schools.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                                No schools onboarded yet. Click &quot;Onboard School&quot; to add the first one.
                                            </td>
                                        </tr>
                                    ) : (
                                        schools.map((school) => (
                                            <tr key={school.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[hsl(var(--primary))] flex items-center justify-center font-bold">
                                                            <Building2 className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-medium">{school.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-[hsl(var(--muted-foreground))]">{school.id}</td>
                                                <td className="p-4 text-sm">{school.contactEmail || "—"}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${school.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                                        {school.active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button onClick={() => handleToggle(school.id)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors" title={school.active ? "Deactivate" : "Activate"}>
                                                        {school.active ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
