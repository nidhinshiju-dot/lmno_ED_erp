"use client";

import { Clock, BookOpen, MapPin, Info } from "lucide-react";

// Static timetable view - in a real system this would fetch from /timetable/my
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
    { time: "08:00 - 08:45", subject: "Mathematics", room: "Room 101", teacher: "Mr. Ravi Kumar" },
    { time: "09:00 - 09:45", subject: "Physics", room: "Room 205", teacher: "Ms. Priya Nair" },
    { time: "10:00 - 10:45", subject: "English", room: "Room 102", teacher: "Mr. James Philip" },
    { time: "11:00 - 11:30", subject: "Break", room: "", teacher: "" },
    { time: "11:30 - 12:15", subject: "Chemistry", room: "Lab 1", teacher: "Ms. Asha Menon" },
    { time: "01:00 - 01:45", subject: "History", room: "Room 104", teacher: "Mr. George Thomas" },
];

const subjectColors: Record<string, string> = {
    Mathematics: "bg-blue-100 text-blue-700 border-blue-200",
    Physics: "bg-indigo-100 text-indigo-700 border-indigo-200",
    English: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Break: "bg-amber-50 text-amber-500 border-amber-200",
    Chemistry: "bg-orange-100 text-orange-700 border-orange-200",
    History: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function StudentTimetablePage() {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">My Timetable</h1>
                    <p className="text-sm text-slate-500 mt-1">Your weekly class schedule. Today is <span className="font-bold text-sky-600">{today}</span>.</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-700 dark:text-amber-400">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    This is a sample timetable. Your actual schedule is managed by your school administrator.
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-sky-600" />
                        <h2 className="font-bold text-slate-800 dark:text-zinc-100">Daily Schedule</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {periods.map((p, i) => {
                            const colorClass = subjectColors[p.subject] || "bg-slate-100 text-slate-700 border-slate-200";
                            const isBreak = p.subject === "Break";
                            return (
                                <div key={i} className={`flex items-center gap-4 px-6 py-4 ${isBreak ? "bg-slate-50/50 dark:bg-zinc-800/20" : ""}`}>
                                    <div className="w-24 text-xs font-mono text-slate-400 shrink-0">{p.time}</div>
                                    <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border ${colorClass}`}>
                                        {!isBreak && <BookOpen className="w-4 h-4 shrink-0" />}
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{p.subject}</p>
                                            {p.teacher && <p className="text-xs opacity-70 mt-0.5">{p.teacher}</p>}
                                        </div>
                                        {p.room && (
                                            <div className="flex items-center gap-1 text-xs opacity-60 font-medium">
                                                <MapPin className="w-3 h-3" />{p.room}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
