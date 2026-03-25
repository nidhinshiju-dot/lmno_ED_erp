"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { StaffService, SubjectService, CredentialsResetService } from "@/lib/api";
import {
    ArrowLeft, User, Phone, Mail, Briefcase, GraduationCap, Calendar,
    Loader2, KeyRound, Copy, Check, MessageSquare, AlertCircle,
    Edit2, Trash2, BookOpen, Clock, Send, X, MapPin
} from "lucide-react";

interface StaffProps {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    highestQualification?: string;
    joinDate?: string;
    dob?: string;
    address?: string;
    gender?: string;
    status: string;
    userId: string | null;
    subjects?: string[];
    teacherType?: string;
    maxPeriods?: number;
    workloadRatio?: number;
}

interface Subject { id: string; name: string; }

// --- Password Reset Card ---
function PasswordResetCard({ username, entityId, phone }: { username: string | null; entityId: string; phone?: string }) {
    const [resetLink, setResetLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sendingWA, setSendingWA] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [waSuccess, setWaSuccess] = useState(false);

    const handleGenerate = async () => {
        if (!username) { setError("No login username linked to this account."); return; }
        setLoading(true); setError(null);
        try {
            const link = await CredentialsResetService.generateResetLink(username);
            setResetLink(link);
        } catch (e: any) {
            setError(e.message || "Failed to generate link.");
        } finally { setLoading(false); }
    };

    const handleSendWA = async () => {
        setSendingWA(true); setError(null);
        try {
            await CredentialsResetService.sendResetLink("teachers", entityId);
            setWaSuccess(true);
            setTimeout(() => setWaSuccess(false), 3000);
        } catch (e: any) {
            setError(e.message || "Failed to send WhatsApp.");
        } finally { setSendingWA(false); }
    };

    const handleSendEmail = () => {
        if (!resetLink) { setError("Generate the reset link first."); return; }
        setSendingEmail(true);
        const subject = "Your Password Reset Link";
        const body = `Hello,\n\nYou can reset your school portal password using the link below:\n\n${resetLink}\n\nThis link will expire shortly.\n\nRegards,\nSchool Admin`;
        window.open(`mailto:${username}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setTimeout(() => setSendingEmail(false), 1000);
    };

    const handleCopy = () => {
        if (!resetLink) return;
        navigator.clipboard.writeText(resetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/30 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-1 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" /> Login Credentials
            </h3>
            <p className="text-xs text-slate-400 mb-4">Manage this teacher&apos;s portal access</p>

            {/* Username display */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">System Login Username</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 px-3 py-2 rounded-lg truncate">
                        {username || <span className="text-slate-400 italic font-sans">No username linked</span>}
                    </div>
                    {username && (
                        <button onClick={() => navigator.clipboard.writeText(username)} className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Copy username">
                            <Copy className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Default password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Temporary123!</code></p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-3 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
            )}

            {/* Reset link display */}
            {resetLink && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Generated Reset Link</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg truncate">
                            {resetLink}
                        </div>
                        <button onClick={handleCopy} title="Copy link" className={`flex-shrink-0 p-2 rounded-lg border transition-all ${copied ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "border-slate-200 hover:bg-slate-100 text-slate-600"}`}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !username}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {resetLink ? "Regenerate Reset Link" : "Generate Reset Link"}
                </button>

                {resetLink && (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleSendWA}
                            disabled={sendingWA}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#25D366] hover:bg-[#1DA851] disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all"
                        >
                            {sendingWA ? <Loader2 className="w-4 h-4 animate-spin" /> : waSuccess ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                            {waSuccess ? "Sent!" : "WhatsApp"}
                        </button>
                        <button
                            onClick={handleSendEmail}
                            disabled={sendingEmail}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all"
                        >
                            {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function EditStaffModal({
    staff, subjects, onClose, onSaved
}: { staff: StaffProps; subjects: Subject[]; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({
        name: staff.name || "",
        department: staff.department || "Administration",
        designation: staff.designation || "",
        phone: staff.phone || "",
        teacherType: staff.teacherType || "FULL_TIME",
        maxPeriods: staff.maxPeriods || 30,
        workloadRatio: staff.workloadRatio || 1.0,
        subjects: staff.subjects || [] as string[],
        gender: staff.gender || "",
        dob: staff.dob || "",
        joinDate: staff.joinDate || "",
        highestQualification: staff.highestQualification || "",
        address: staff.address || "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleSubject = (sid: string) => {
        setForm(p => ({
            ...p,
            subjects: p.subjects.includes(sid)
                ? p.subjects.filter(s => s !== sid)
                : [...p.subjects, sid]
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError(null);
        try {
            await StaffService.update(staff.id, form);
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save changes.");
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-emerald-500" /> Edit Staff Profile
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                        <input className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                            <input className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Department</label>
                            <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                                <option>Teaching</option>
                                <option>Administration</option>
                                <option>Finance</option>
                                <option>Support</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Designation</label>
                            <input className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Gender</label>
                            <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                                <option value="">Select Gender...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date of Birth</label>
                            <input type="date" className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date of Joining</label>
                            <input type="date" className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.joinDate} onChange={e => setForm(p => ({ ...p, joinDate: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Highest Qualification</label>
                            <input className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.highestQualification} onChange={e => setForm(p => ({ ...p, highestQualification: e.target.value }))} placeholder="e.g. Master's in Education" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Teacher Type</label>
                            <select className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={form.teacherType} onChange={e => setForm(p => ({ ...p, teacherType: e.target.value }))}>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Max Periods/Week</label>
                        <input type="number" min={1} max={50} className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={form.maxPeriods} onChange={e => setForm(p => ({ ...p, maxPeriods: parseInt(e.target.value) || 30 }))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Address</label>
                        <textarea className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-16" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Enter full address" />
                    </div>
                    {form.department === "Teaching" && subjects.length > 0 && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Qualified Subjects</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-100 rounded-lg p-3">
                                {subjects.map(s => (
                                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-emerald-700">
                                        <input type="checkbox" checked={form.subjects.includes(s.id)} onChange={() => toggleSubject(s.id)} className="rounded accent-emerald-600" />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
                <div className="p-5 border-t border-slate-100 dark:border-zinc-800 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} onClick={handleSave as any} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---
export default function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [staff, setStaff] = useState<StaffProps | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [data, subData] = await Promise.all([
                StaffService.getById(id),
                SubjectService.getAll().catch(() => [])
            ]);
            setStaff(data);
            setSubjects(subData || []);
        } catch {
            setError("Unable to load staff profile.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [id]);

    const handleDelete = async () => {
        if (!staff) return;
        if (!confirm(`Remove ${staff.name} from the system? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await StaffService.delete(id);
            router.push("/staff");
        } catch (err: any) {
            alert(err.message || "Failed to delete.");
            setDeleting(false);
        }
    };

    const getSubjectNames = (ids?: string[]) =>
        (ids || []).map(sid => subjects.find(s => s.id === sid)?.name).filter(Boolean).join(", ");

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error || !staff) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    {error || "Staff member not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">Staff Profile</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            <span className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">{staff.employeeId || "N/A"}</span>
                            {" "}&bull;{" "}{staff.name}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setEditOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {deleting ? "Removing..." : "Delete"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-teal-500 to-emerald-600 relative">
                            <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${staff.status === "ACTIVE" || !staff.status ? "bg-white/90 text-emerald-600" : "bg-white/90 text-slate-500"}`}>
                                {staff.status || "ACTIVE"}
                            </span>
                        </div>
                        <div className="px-5 pb-5 relative">
                            <div className="absolute -top-10 left-5 ring-4 ring-white dark:ring-zinc-900 bg-slate-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-2xl font-bold text-slate-600 dark:text-zinc-200">{staff.name?.charAt(0) || "?"}</span>
                            </div>
                            <div className="pt-12">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{staff.name}</h3>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{staff.designation || "Staff"}</p>
                            </div>
                            <hr className="my-4 border-slate-100 dark:border-zinc-800" />
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span className="font-medium text-slate-700 dark:text-zinc-300">{staff.phone || "N/A"}</span>
                                </div>
                                <div className="flex items-start gap-3 text-slate-500">
                                    <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span className="font-medium text-slate-700 dark:text-zinc-300 break-all">{staff.email || "N/A"}</span>
                                </div>
                                {staff.subjects && staff.subjects.length > 0 && (
                                    <div className="flex items-start gap-3 text-slate-500">
                                        <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span className="font-medium text-slate-700 dark:text-zinc-300 text-xs">
                                            {getSubjectNames(staff.subjects)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password Reset Card */}
                    {staff.userId ? (
                        <PasswordResetCard username={staff.email} entityId={id} phone={staff.phone} />
                    ) : (
                        <div className="bg-slate-50 dark:bg-zinc-800/50 border border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-6 text-center">
                            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">No login account has been provisioned for this staff member.</p>
                        </div>
                    )}
                </div>

                {/* Right column - Employment Details */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-5 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-emerald-500" /> Employment Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{staff.department || "General"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Designation</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{staff.designation || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Teacher Type</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                    {staff.teacherType?.replace("_", " ") || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Max Periods / Week</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {staff.maxPeriods ?? "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date of Joining</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : "Not specified"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Qualification</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                    {staff.highestQualification || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-5 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" /> Personal Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{staff.gender || "Not specified"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    {staff.dob ? new Date(staff.dob).toLocaleDateString() : "Not specified"}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 flex items-start gap-1.5 mt-1">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{staff.address || "Not specified"}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Card */}
                    {staff.department === "Teaching" && (
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500" /> Qualified Subjects
                            </h3>
                            {staff.subjects && staff.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {staff.subjects.map(sid => {
                                        const sub = subjects.find(s => s.id === sid);
                                        return (
                                            <span key={sid} className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-sm font-medium">
                                                {sub?.name || sid}
                                            </span>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No subjects assigned yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editOpen && (
                <EditStaffModal
                    staff={staff}
                    subjects={subjects}
                    onClose={() => setEditOpen(false)}
                    onSaved={loadData}
                />
            )}
        </div>
    );
}
