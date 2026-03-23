"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { CalendarDays, ClipboardCheck, BookOpen, Award, Clock, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

export default function StudentDashboard() {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // The student's id is their user's tenant-linked student record
                // We fetch the student profile matching the logged-in user
                const data = await fetchWithAuth(`/students/me`).catch(() => null);
                setStudentData(data);
            } catch (e) { /* graceful degradation */ }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const firstName = user?.name?.split(" ")[0] || "Student";

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">

                {/* Hero Greeting */}
                <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-sky-500/20 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                    <div className="relative">
                        <p className="text-sky-200 text-sm font-semibold uppercase tracking-wider mb-2">
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <h1 className="text-3xl font-extrabold">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {firstName}! 👋</h1>
                        <p className="text-sky-100 mt-2 text-sm max-w-lg">
                            Stay on top of your classes and make the most of your day.
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/student/timetable" className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-3">
                            <CalendarDays className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timetable</p>
                        <p className="text-lg font-extrabold text-slate-800 dark:text-zinc-100 mt-0.5">Today's Schedule</p>
                    </Link>

                    <Link href="/student/attendance" className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                            <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
                        <p className="text-lg font-extrabold text-slate-800 dark:text-zinc-100 mt-0.5">View Record</p>
                    </Link>

                    <Link href="/student/subjects" className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-orange-300 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                            <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects</p>
                        <p className="text-lg font-extrabold text-slate-800 dark:text-zinc-100 mt-0.5">Enrolled Courses</p>
                    </Link>

                    <Link href="/student/exams" className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-200">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exams</p>
                        <p className="text-lg font-extrabold text-slate-800 dark:text-zinc-100 mt-0.5">Results & Marks</p>
                    </Link>
                </div>

                {/* Notice */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Personal Data Notice</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                            Your profile, timetable, and attendance data are managed by your school administrator. Contact your class teacher or admin if you see any discrepancies.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
