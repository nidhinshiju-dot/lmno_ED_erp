"use client";

import { useState, useEffect } from "react";
import { Award, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { ExamService, SubjectService } from "@/lib/api";

export default function StudentExamsPage() {
    const { user, isAuthenticated } = useAuth();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadData();
        }
    }, [isAuthenticated, user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch student results, all exams, and all subjects to map beautiful names
            const [studentResults, allExams, allSubjects] = await Promise.all([
                ExamService.getStudentResults(user!.id),
                ExamService.getAll(),
                SubjectService.getAll()
            ]);

            // Combine the data to make it easy to render
            const enrichedResults = studentResults.map((result: any) => {
                const exam = allExams.find((e: any) => e.id === result.examId);
                const subject = exam ? allSubjects.find((s: any) => s.id === exam.subjectId) : null;
                return {
                    ...result,
                    examName: exam?.name || "Unknown Exam",
                    examDate: exam?.examDate,
                    totalMarks: exam?.totalMarks || 100,
                    subjectName: subject?.name || "Unknown Subject",
                    status: exam?.status || "UNKNOWN"
                };
            }).filter((r: any) => r.status === "RESULTS_PUBLISHED"); // Only show published results!

            setResults(enrichedResults);
        } catch (error) {
            console.error("Failed to load student exam results", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex-1 p-12 text-center text-slate-500">Loading your scorecards...</div>;
    }

    const totalObtained = results.reduce((s, r) => s + r.marksObtained, 0);
    const totalMax = results.reduce((s, r) => s + r.totalMarks, 0);
    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">Exams & Scorecards</h1>
                    <p className="text-sm text-slate-500 mt-1">Your official verified examination results.</p>
                </div>

                {results.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 dark:text-zinc-100">No Results Available</h3>
                        <p className="text-sm text-slate-500 mt-1">Check back later when teachers have published your exam scores.</p>
                    </div>
                ) : (
                    <>
                        {/* Overall Card */}
                        <div className={`bg-gradient-to-r ${overallPct >= 75 ? "from-emerald-500 to-teal-600" : overallPct >= 50 ? "from-amber-500 to-orange-600" : "from-red-500 to-rose-600"} text-white rounded-2xl p-6 shadow-lg flex items-center justify-between`}>
                            <div>
                                <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Overall Performance</p>
                                <p className="text-4xl font-extrabold mt-1">{overallPct}%</p>
                                <p className="text-white/80 text-sm mt-1">{totalObtained}/{totalMax} marks cumulative</p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Exam results list */}
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2 bg-slate-50/50">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                <h2 className="font-bold text-slate-800 dark:text-zinc-100">Subject Breakdown</h2>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {results.map((r, i) => {
                                    const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
                                    const color = pct >= 75 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : pct >= 50 ? "text-amber-600 bg-amber-50 border-amber-100" : "text-red-600 bg-red-50 border-red-100";
                                    return (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-base font-bold text-slate-800 dark:text-zinc-100">{r.subjectName}</p>
                                                    {r.classRank === 1 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded-md border border-yellow-200">Class Topper</span>}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1">{r.examName} • {r.examDate ? new Date(r.examDate).toLocaleDateString("en-IN") : "TBA"}</p>
                                                {r.remarks && <p className="text-sm mt-3 text-slate-600 dark:text-zinc-400 bg-slate-50 p-2 rounded-lg border border-slate-100">"{r.remarks}"</p>}
                                            </div>
                                            
                                            <div className="flex items-center gap-6 sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Rank</p>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                                                        {r.classRank ? `#${r.classRank}` : "-"}
                                                        <span className="text-slate-400 font-normal text-xs ml-1">/ {r.totalStudents || "-"}</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Score</p>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{r.marksObtained}/{r.totalMarks}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${color}`}>{r.grade} ({pct}%)</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
