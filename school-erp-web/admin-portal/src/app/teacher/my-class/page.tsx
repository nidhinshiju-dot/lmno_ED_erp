"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { fetchWithAuth } from "@/lib/api";
import { Users, ClipboardCheck, AlertCircle } from "lucide-react";

export default function MyClassPage() {
    const [classData, setClassData] = useState<{ classDetails: any; students: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMyClass = async () => {
            try {
                const userRaw = localStorage.getItem("erp_user");
                let userId = "mock-teacher-id";
                if (userRaw) {
                    userId = JSON.parse(userRaw).id;
                }

                const data = await fetchWithAuth("/teacher/my-class", {
                    headers: { "X-User-Id": userId }
                });
                setClassData(data);
            } catch (err) {
                console.error("Failed to load class details", err);
            } finally {
                setLoading(false);
            }
        };

        loadMyClass();
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
            <Header />

            <main className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
                
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-emerald-600" />
                        My Class (Homeroom)
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm max-w-2xl">
                        Manage your primary assigned classroom. View your student roster and record daily morning attendance.
                    </p>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-3xl" />
                        <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-3xl" />
                    </div>
                ) : !classData || !classData.classDetails ? (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
                        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-zinc-300">No Homeroom Assigned</h3>
                        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
                            You are not currently designated as the primary Class Teacher for any section. Only Class Teachers have access to the Homeroom Attendance module.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/30 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100 uppercase">
                                        Grade {classData.classDetails.gradeLevel}-{classData.classDetails.branch}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium flex gap-2">
                                        <span>Room: {classData.classDetails.roomNumber}</span>
                                        <span>•</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">{classData.students.length}/{classData.classDetails.capacity} Students Enrolled</span>
                                    </p>
                                </div>
                            </div>
                            
                            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5" />
                                Record Morning Attendance
                            </button>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                                <h4 className="font-bold text-slate-800 dark:text-zinc-200">Enrolled Student Roster</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider dark:bg-zinc-800/50 dark:text-zinc-400 text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Admission #</th>
                                            <th className="px-6 py-4">Student Name</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {classData.students.map((student: any) => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition">
                                                <td className="px-6 py-4 font-mono font-medium text-slate-600 dark:text-zinc-300">
                                                    {student.admissionNumber}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-zinc-200">
                                                    {student.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
