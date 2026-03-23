"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { fetchWithAuth } from "@/lib/api";
import { BookOpen, Layers } from "lucide-react";

export default function MySubjectsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const userRaw = localStorage.getItem("erp_user");
                let userId = "mock-teacher-id";
                if (userRaw) {
                    userId = JSON.parse(userRaw).id;
                }

                const data = await fetchWithAuth("/teacher/my-subjects", {
                    headers: { "X-User-Id": userId }
                });
                setAssignments(data || []);
            } catch (err) {
                console.error("Failed to load subject assignments", err);
            } finally {
                setLoading(false);
            }
        };

        loadSubjects();
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
            <Header />

            <main className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
                
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-orange-600" />
                        My Assigned Subjects
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm max-w-2xl">
                        A detailed breakdown of all the courses you have been assigned to teach across different classes and sections.
                    </p>
                </div>

                {loading ? (
                    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-zinc-800 rounded-3xl" />)}
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
                        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-zinc-300">No Subjects Assigned</h3>
                        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
                            You have not been linked to any specific subjects by the Administration. 
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map(assignment => (
                            <div key={assignment.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-orange-300 transition group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100 to-transparent dark:from-orange-900/20 opacity-50 rounded-bl-[100px] pointer-events-none" />
                                
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${assignment.role === 'PRIMARY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                        {assignment.role} TEACHER
                                    </div>
                                    {assignment.isLab && (
                                        <div className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800 uppercase">
                                            Laboratory
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 mb-1 line-clamp-1">{assignment.subjectId}</h3>
                                <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mb-6">
                                    <Layers className="w-3.5 h-3.5" /> Class ID: {assignment.classId}
                                </p>

                                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Periods / Week</p>
                                        <p className="font-mono text-lg font-bold text-slate-700 dark:text-zinc-200">{assignment.periodsPerWeek}</p>
                                    </div>
                                    <button className="text-sm font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 transition">
                                        View Roster →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
