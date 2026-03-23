"use client";

import { CheckCircle, XCircle, MinusCircle, TrendingUp, Info } from "lucide-react";

const attendanceHistory = [
    { date: "2026-03-19", status: "PRESENT", subject: "All Periods" },
    { date: "2026-03-18", status: "ABSENT", subject: "Period 3 (English)" },
    { date: "2026-03-17", status: "PRESENT", subject: "All Periods" },
    { date: "2026-03-14", status: "PRESENT", subject: "All Periods" },
    { date: "2026-03-13", status: "LATE", subject: "Period 1 (Mathematics)" },
    { date: "2026-03-12", status: "PRESENT", subject: "All Periods" },
];

const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
    PRESENT: { icon: CheckCircle, label: "Present", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    ABSENT: { icon: XCircle, label: "Absent", color: "text-red-600", bg: "bg-red-50 border-red-200" },
    LATE: { icon: MinusCircle, label: "Late", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
};

export default function StudentAttendancePage() {
    const presentCount = attendanceHistory.filter(a => a.status === "PRESENT").length;
    const total = attendanceHistory.length;
    const percentage = Math.round((presentCount / total) * 100);

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">Attendance Record</h1>
                    <p className="text-sm text-slate-500 mt-1">Your daily attendance history this semester.</p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
                        <p className="text-3xl font-extrabold text-emerald-600">{presentCount}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Present</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
                        <p className="text-3xl font-extrabold text-red-600">{attendanceHistory.filter(a => a.status === "ABSENT").length}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Absent</p>
                    </div>
                    <div className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 text-center ${percentage >= 75 ? "border-emerald-300" : "border-red-300"}`}>
                        <p className={`text-3xl font-extrabold ${percentage >= 75 ? "text-emerald-600" : "text-red-600"}`}>{percentage}%</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Attendance</p>
                    </div>
                </div>

                {/* Note */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" /> Sample attendance data for demonstration. Your actual records are updated by your teachers.
                </div>

                {/* History */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h2 className="font-bold text-slate-800 dark:text-zinc-100">Recent History</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {attendanceHistory.map((entry, i) => {
                            const config = statusConfig[entry.status];
                            const Icon = config.icon;
                            return (
                                <div key={i} className="flex items-center gap-4 px-6 py-4">
                                    <div className="text-sm font-mono text-slate-400 w-28 shrink-0">{new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${config.bg} ${config.color}`}>
                                        <Icon className="w-3.5 h-3.5" />{config.label}
                                    </div>
                                    <p className="text-xs text-slate-500 flex-1">{entry.subject}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
