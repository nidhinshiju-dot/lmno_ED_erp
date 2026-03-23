import { CalendarDays, Users, Clock, ClipboardCheck, GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function TeacherDashboard() {
    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
            <Header />
            <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                
                {/* Greeting Section */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            <span>Welcome back, Teacher!</span>
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Faculty</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm max-w-2xl">
                            Here is an overview of your academic responsibilities for today. You have 4 periods scheduled and your homeroom attendance is pending.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/teacher/my-class" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2 text-sm">
                            <ClipboardCheck className="w-4 h-4" />
                            Take Homeroom Attendance
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-start justify-between group hover:border-indigo-300 transition">
                        <div>
                            <p className="text-sm font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Upcoming Period</p>
                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">Grade 10 Physics</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> 09:00 AM — Room 102
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-start justify-between group hover:border-emerald-300 transition">
                        <div>
                            <p className="text-sm font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">My Class (Homeroom)</p>
                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">Grade 8-A</h3>
                            <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center gap-1">
                                40 Students Registered
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-start justify-between group hover:border-orange-300 transition">
                        <div>
                            <p className="text-sm font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Assigned Subjects</p>
                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">3 Courses</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                                Physics, Math, Comp Sci
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>

                {/* Today's Agenda visual mockup */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" /> Today's Agenda
                    </h2>
                    
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 bg-indigo-600 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow absolute left-0 md:left-1/2 -translate-x-1/2">
                                <ClipboardCheck className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-14 md:ml-0 p-4 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-sm">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">Homeroom Attendance</div>
                                    <time className="font-mono text-indigo-600 text-xs font-bold">08:00 AM</time>
                                </div>
                                <div className="text-slate-500 dark:text-zinc-400 text-sm">Grade 8-A (Room 101)</div>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 bg-slate-300 text-slate-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow absolute left-0 md:left-1/2 -translate-x-1/2">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-14 md:ml-0 p-4 rounded-xl border border-slate-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 shadow-sm">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Physics (Period 1)</div>
                                    <time className="font-mono text-slate-500 text-xs font-bold">09:00 AM</time>
                                </div>
                                <div className="text-slate-500 dark:text-zinc-400 text-sm">Grade 10 (Room 205)</div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
