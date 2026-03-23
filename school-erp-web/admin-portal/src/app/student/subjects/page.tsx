"use client";

import { BookOpen, User, Clock } from "lucide-react";

const subjects = [
    { name: "Mathematics", teacher: "Mr. Ravi Kumar", periods: 5, color: "from-blue-500 to-blue-600" },
    { name: "Physics", teacher: "Ms. Priya Nair", periods: 4, color: "from-indigo-500 to-indigo-600" },
    { name: "English", teacher: "Mr. James Philip", periods: 6, color: "from-emerald-500 to-emerald-600" },
    { name: "Chemistry", teacher: "Ms. Asha Menon", periods: 4, color: "from-orange-500 to-orange-600" },
    { name: "History", teacher: "Mr. George Thomas", periods: 3, color: "from-rose-500 to-rose-600" },
    { name: "Computer Science", teacher: "Ms. Linda Joseph", periods: 4, color: "from-purple-500 to-purple-600" },
];

export default function StudentSubjectsPage() {
    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">My Subjects</h1>
                    <p className="text-sm text-slate-500 mt-1">All subjects you are currently enrolled in this academic year.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((sub, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200">
                            <div className={`h-2 bg-gradient-to-r ${sub.color}`} />
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sub.color} flex items-center justify-center shadow-sm`}>
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">{sub.name}</h3>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{sub.teacher}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{sub.periods} periods/week</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
