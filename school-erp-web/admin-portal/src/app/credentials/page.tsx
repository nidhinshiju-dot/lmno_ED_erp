"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { MessageSquare, RefreshCw, KeyRound, ExternalLink } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

type CategoryTab = "teachers" | "students" | "parents";

export default function CredentialsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<CategoryTab>("teachers");
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCredentials = async () => {
            setLoading(true);
            try {
                const data = await fetchWithAuth(`/credentials/${activeTab}`);
                setCredentials(data || []);
            } catch (err) {
                console.error("Failed to load credentials", err);
            } finally {
                setLoading(false);
            }
        };

        loadCredentials();
    }, [activeTab]);

    const handleBulkWhatsapp = async () => {
        if (!credentials || credentials.length === 0) {
            alert("No users available to broadcast to.");
            return;
        }

        const confirm = window.confirm(`This will broadcast to all Teachers, Students, and Parents with the reset link. Use this wisely. You can also send personally by searching teacher, student, or parent in the list and send them from the profile.`);
        if (!confirm) return;

        try {
            const userIds = credentials.map(c => c.id.toString());
            
            const req = await fetchWithAuth("/credentials/send-bulk", {
                method: "POST",
                body: JSON.stringify({ type: activeTab, ids: userIds })
            });
            alert(`✅ ${req.message || "Broadcast successfully initiated."}`);
        } catch (error: any) {
            alert(`❌ Broadcast failed: ${error.message}`);
        }
    };

    const handleRowClick = (cred: any) => {
        if (activeTab === "teachers") {
            router.push(`/staff/${cred.id}`);
        } else if (activeTab === "students") {
            router.push(`/students/${cred.id}`);
        } else if (activeTab === "parents") {
            router.push(`/parents/${cred.id}`);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">

            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                                <KeyRound className="w-8 h-8 text-emerald-600" />
                                User Credentials Directory
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
                                View all registered platform users or instantly broadcast secure password reset links directly to their WhatsApp.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleBulkWhatsapp}
                                className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white transition-all rounded-xl font-bold shadow-sm shadow-[#25D366]/20 flex items-center gap-2 text-sm"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Broadcast Reset Links
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6">
                        {(['teachers', 'students', 'parents'] as CategoryTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Table View */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-4" />
                                <p className="text-slate-500 font-medium text-sm">Loading security roster...</p>
                            </div>
                        ) : credentials.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <KeyRound className="w-16 h-16 text-slate-200 dark:text-zinc-800 mb-4" />
                                <h3 className="text-xl font-bold text-slate-700 dark:text-zinc-300 capitalize">No {activeTab} Found</h3>
                                <p className="text-slate-500 max-w-sm mt-2 text-sm">
                                    There are currently no records for this role.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider dark:bg-zinc-800/50 dark:text-zinc-400 text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Contact Ref</th>
                                            <th className="px-6 py-4">Username (AuthID)</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {credentials.map((cred) => (
                                            <tr 
                                                key={cred.id} 
                                                onClick={() => handleRowClick(cred)}
                                                className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200">
                                                    {cred.name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-mono text-xs">
                                                    {cred.contact || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                        {cred.username}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-bold text-emerald-600 flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                                                        View Data <ExternalLink className="w-3 h-3" />
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
