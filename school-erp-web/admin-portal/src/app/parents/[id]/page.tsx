"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ParentService, CredentialsResetService } from "@/lib/api";
import { ArrowLeft, User, Phone, Loader2, Users, KeyRound, Send, Copy, Check, MessageSquare, AlertCircle } from "lucide-react";

interface ParentProps {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    relation: string;
    userId: string | null;
}

interface StudentProps {
    id: string;
    name: string;
    admissionNumber: string;
    photoUrl: string | null;
    status: string;
}

// --- Password Reset Card Component ---
function PasswordResetCard({ username, entityId, type }: { username: string | null; entityId: string; type: string }) {
    const [resetLink, setResetLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleGenerate = async () => {
        if (!username) { setError("No username (email) linked to this account. Cannot generate reset link."); return; }
        setLoading(true); setError(null);
        try {
            const link = await CredentialsResetService.generateResetLink(username);
            setResetLink(link);
        } catch (e: any) {
            setError(e.message || "Failed to generate link.");
        } finally { setLoading(false); }
    };

    const handleSend = async () => {
        setSending(true); setError(null);
        try {
            await CredentialsResetService.sendResetLink(type, entityId);
            setSent(true);
            setTimeout(() => setSent(false), 3000);
        } catch (e: any) {
            setError(e.message || "Failed to send.");
        } finally { setSending(false); }
    };

    const handleCopy = () => {
        if (!resetLink) return;
        navigator.clipboard.writeText(resetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" /> Password Reset
            </h3>

            {/* Username row */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Platform Username</p>
                <div className="font-mono text-sm text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-2 rounded-lg">
                    {username || <span className="text-slate-400 italic">No username linked</span>}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
            )}

            {/* Generated link */}
            {resetLink && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reset Link</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg truncate">
                            {resetLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            title="Copy link"
                            className={`flex-shrink-0 p-2 rounded-lg border transition-all ${copied ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "border-slate-200 hover:bg-slate-100 text-slate-600"}`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !username}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {resetLink ? "Regenerate Link" : "Generate Reset Link"}
                </button>
                <button
                    onClick={handleSend}
                    disabled={sending || !username}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1DA851] disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all"
                >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    {sent ? "Sent!" : "Send via WhatsApp"}
                </button>
            </div>
        </div>
    );
}

export default function ParentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [parentData, setParentData] = useState<ParentProps | null>(null);
    const [students, setStudents] = useState<StudentProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchParentData = async () => {
            try {
                const [data, studentData] = await Promise.all([
                    ParentService.getById(id),
                    ParentService.getStudents(id)
                ]);
                setParentData(data);
                setStudents(studentData || []);
            } catch (err: any) {
                console.error("Failed to fetch parent profile", err);
                setError("Unable to load parent profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchParentData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !parentData) {
        return (
            <div className="flex-1 p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    {error || "Parent record not found."}
                </div>
            </div>
        );
    }

    const username = parentData.email || parentData.phoneNumber || null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">Parent / Guardian Profile</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{parentData.relation || "Guardian"} • {parentData.phoneNumber}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Profile card + Reset */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Profile card */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                            <span className="absolute top-3 right-3 text-white text-xs font-bold uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                                {parentData.relation || "GUARDIAN"}
                            </span>
                        </div>
                        <div className="px-5 pb-5 relative">
                            <div className="absolute -top-10 left-5 ring-4 ring-white dark:ring-zinc-900 bg-slate-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center shadow-md">
                                <User className="w-9 h-9 text-slate-400" />
                            </div>
                            <div className="pt-12">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{parentData.name}</h3>
                            </div>
                            <hr className="my-4 border-slate-100 dark:border-zinc-800" />
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span className="font-medium text-slate-700 dark:text-zinc-300">{parentData.phoneNumber || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Reset Card */}
                    <PasswordResetCard username={username} entityId={id} type="parents" />
                </div>

                {/* Right: Linked Students */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-5 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> Associated Students
                            <span className="ml-auto text-xs font-normal text-slate-400">{students.length} student{students.length !== 1 ? "s" : ""}</span>
                        </h3>

                        {students.length === 0 ? (
                            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                                <User className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-500">No students are currently mapped to this parent.</p>
                                <p className="text-xs text-slate-400 mt-1">Students are linked automatically via their parent contact number when registered.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {students.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => router.push(`/students/${student.id}`)}
                                        className="group flex items-center gap-4 p-4 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all duration-200"
                                    >
                                        <div className="w-11 h-11 bg-slate-100 dark:bg-zinc-800 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {student.photoUrl ? (
                                                <img src={student.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate group-hover:text-indigo-700 transition-colors">{student.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs">
                                                <span className="font-mono text-slate-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{student.admissionNumber}</span>
                                                <span className={`px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide ${student.status === "ACTIVE" ? "text-emerald-700 bg-emerald-100" : "text-slate-500 bg-slate-100"}`}>
                                                    {student.status || "ACTIVE"}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 rotate-180 transition-all" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
