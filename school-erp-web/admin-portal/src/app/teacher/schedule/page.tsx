"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { fetchWithAuth } from "@/lib/api";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function TeacherSchedulePage() {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                // Determine user ID mapping
                const userRaw = localStorage.getItem("erp_user");
                let userId = "mock-teacher-id"; // Fallback
                if (userRaw) {
                    const u = JSON.parse(userRaw);
                    userId = u.id; // Passing auth user id down to the Service
                }

                // In production, the backend might extract this directly from the JWT.
                // For this Architecture, we're passing it explicitly via Header
                const data = await fetchWithAuth("/teacher/schedule", {
                    headers: {
                        "X-User-Id": userId
                    }
                });
                
                // Group by Day and Time
                setSchedule(data || []);
            } catch (err) {
                console.error("Failed to load schedule", err);
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, []);

    const getPeriodsForDay = (day: string) => {
        return schedule
            .filter(s => s.dayId === day)
            .sort((a, b) => parseInt(a.blockId) - parseInt(b.blockId));
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
            <Header />

            <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <CalendarDays className="w-8 h-8 text-indigo-600" />
                        My Schedule
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm max-w-2xl">
                        Your personalized academic weekly timetable. Only periods where you are actively assigned to teach or assist are displayed below.
                    </p>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 dark:bg-zinc-800 rounded-3xl" />)}
                    </div>
                ) : (
                    <div className="space-y-10">
                        {DAYS.map(day => {
                            const periods = getPeriodsForDay(day);
                            if (periods.length === 0) return null;

                            return (
                                <section key={day} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                        {day}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {periods.map(period => (
                                            <div key={period.id} className={`p-5 rounded-2xl border transition hover:-translate-y-1 hover:shadow-lg ${period.isLab ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50' : 'bg-slate-50 border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-700/50'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${period.isLab ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200' : 'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'}`}>
                                                        {period.isLab ? 'Lab' : 'Lecture'}
                                                    </span>
                                                    <span className="text-slate-500 font-mono text-xs font-bold inline-flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" /> Block {period.blockId}
                                                    </span>
                                                </div>

                                                <h4 className="font-extrabold text-slate-800 dark:text-zinc-100 text-lg">{period.subjectName}</h4>
                                                
                                                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-zinc-400">
                                                    <p className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-slate-400" />
                                                        <span className="font-medium text-slate-700 dark:text-zinc-300">{period.className}</span>
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-slate-400" />
                                                        {period.roomName || 'TBD'}
                                                    </p>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                        
                        {schedule.length === 0 && (
                            <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-700">
                                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-600 dark:text-zinc-400">No classes scheduled</h3>
                                <p className="text-slate-500 text-sm mt-1">You currently have no teaching assignments.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
