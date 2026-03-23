"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { ClassService, AttendanceService, AttendanceStatusType, AttendanceStudentResponseDto } from "@/lib/api";
import { CheckCircle, XCircle, Clock, Save, FileWarning, Search, Info } from "lucide-react";

interface SchoolClass { id: string; name: string; }

export default function AttendancePage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [statuses, setStatuses] = useState<AttendanceStatusType[]>([]);
    const [mode, setMode] = useState<string>("DAILY");

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    // Period is mocked for now as UI dropdown, we'll keep it simple
    const [selectedPeriod, setSelectedPeriod] = useState("");

    const [roster, setRoster] = useState<AttendanceStudentResponseDto[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, { statusId: string; remarks: string }>>({});
    
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetchingRoster, setFetchingRoster] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [classData, statusData, initMode] = await Promise.all([
                    ClassService.getAll(),
                    AttendanceService.getStatuses(),
                    AttendanceService.getMode()
                ]);
                setClasses(classData);
                setStatuses(statusData);
                setMode(initMode || "DAILY");
            } catch (err) {
                console.error("Failed to load initial data", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!selectedClass || !selectedDate) {
            setRoster([]);
            return;
        }
        if (mode === "PERIOD" && !selectedPeriod) {
            setRoster([]);
            return;
        }

        const fetchRoster = async () => {
            setFetchingRoster(true);
            try {
                const data = await AttendanceService.getClassRoster(selectedClass, selectedDate, selectedPeriod || undefined);
                setRoster(data);

                // Build initial state map
                const presentStatusId = statuses.find(s => s.code === "PRESENT")?.id || "";
                
                const newMap: Record<string, { statusId: string; remarks: string }> = {};
                data.forEach(student => {
                    newMap[student.studentId] = {
                        statusId: student.statusId || presentStatusId,
                        remarks: student.remarks || ""
                    };
                });
                setAttendanceMap(newMap);
            } catch (error) {
                console.error("Failed to fetch roster", error);
                setRoster([]);
                setAttendanceMap({});
            } finally {
                setFetchingRoster(false);
            }
        };

        fetchRoster();
    }, [selectedClass, selectedDate, selectedPeriod, mode, statuses]);

    const handleStatusChange = (studentId: string, statusId: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], statusId }
        }));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const handleMarkAllPresent = () => {
        const presentStatus = statuses.find(s => s.code === "PRESENT");
        if (!presentStatus) return;

        const newMap = { ...attendanceMap };
        roster.forEach(student => {
            newMap[student.studentId] = {
                statusId: presentStatus.id,
                remarks: newMap[student.studentId]?.remarks || ""
            };
        });
        setAttendanceMap(newMap);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const records = roster.map(student => ({
                studentId: student.studentId,
                statusId: attendanceMap[student.studentId].statusId,
                remarks: attendanceMap[student.studentId].remarks
            }));

            await AttendanceService.submitBatch({
                classId: selectedClass,
                date: selectedDate,
                periodBlockId: selectedPeriod || undefined,
                recordedBy: "admin", // Replace with actual logged-in user ID
                recordedRole: "ADMIN",
                records
            });
            alert("Attendance bulk-saved successfully!");
        } catch (error: any) {
            alert(`Failed to save attendance: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const filteredRoster = roster.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate Stats
    const totalStudents = roster.length;
    const presentStatusId = statuses.find(s => s.code === "PRESENT")?.id;
    const presentCount = Object.values(attendanceMap).filter(v => v.statusId === presentStatusId).length;
    const absentCount = totalStudents - presentCount;

    const isAttendanceTaken = roster.some(student => !!student.attendanceId);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="animate-pulse text-primary font-medium">Loading Attendance Environment...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
            <Header />

            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Page Title & Stats */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Attendance Log
                            </h2>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Record and monitor daily attendance patterns securely. Current Mode: <strong>{mode}</strong>
                            </p>
                        </div>

                        {roster.length > 0 && (
                            <div className="flex items-center gap-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-2xl font-bold">{totalStudents}</p>
                                </div>
                                <div className="w-px h-10 bg-slate-200 dark:bg-zinc-800" />
                                <div className="text-center">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">Present</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                                </div>
                                <div className="w-px h-10 bg-slate-200 dark:bg-zinc-800" />
                                <div className="text-center">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider mb-1">Absent</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Configuration Panel */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div>
                                <label className="text-sm font-semibold mb-2 block text-slate-700 dark:text-zinc-300">Target Class</label>
                                <select 
                                    value={selectedClass} 
                                    onChange={e => setSelectedClass(e.target.value)} 
                                    className="w-full p-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                >
                                    <option value="" className="text-slate-500">Choose class...</option>
                                    {classes.map(c => <option key={c.id} value={c.id} className="text-slate-900 dark:text-white">{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold mb-2 block text-slate-700 dark:text-zinc-300">Date of Record</label>
                                <input 
                                    type="date" 
                                    value={selectedDate} 
                                    max={new Date().toISOString().split("T")[0]} // Prevent future dates
                                    onChange={e => setSelectedDate(e.target.value)} 
                                    className="w-full p-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                                />
                            </div>

                            {mode === "PERIOD" && (
                                <div>
                                    <label className="text-sm font-semibold mb-2 block text-slate-700 dark:text-zinc-300">Period Block</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Period 1"
                                        value={selectedPeriod} 
                                        onChange={e => setSelectedPeriod(e.target.value)} 
                                        className="w-full p-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-transparent focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                                    />
                                </div>
                            )}

                            <div className="flex md:justify-end">
                                {!isAttendanceTaken && roster.length > 0 && (
                                    <button 
                                        onClick={handleMarkAllPresent}
                                        className="px-6 py-3 bg-slate-100 hover:bg-emerald-50 text-emerald-700 dark:bg-zinc-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30 font-semibold rounded-xl transition-all flex items-center gap-2 w-full justify-center md:w-auto"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Mark All Present
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Roster Area */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col min-h-[400px]">
                        
                        {fetchingRoster ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-4" />
                                <p>Fetching live roster data...</p>
                            </div>
                        ) : roster.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 dark:text-zinc-500">
                                <FileWarning className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium text-slate-600 dark:text-zinc-300">No Roster Found</p>
                                <p className="text-sm max-w-sm text-center mt-2">Please select a valid class and configuration from the panel above to begin marking attendance.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="relative w-full max-w-sm">
                                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            placeholder="Search by student name or ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 overflow-y-auto max-h-[60vh]">
                                    {filteredRoster.map(student => {
                                        const currentAtt = attendanceMap[student.studentId];
                                        if (!currentAtt) return null;

                                        return (
                                            <div key={student.studentId} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors gap-4">
                                                
                                                <div className="flex items-center gap-4 min-w-[250px]">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-500 dark:text-zinc-400 shrink-0">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{student.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">{student.admissionNumber}</p>
                                                    </div>
                                                </div>

                                                <div className="flex-1 flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                                                    {statuses.map(status => {
                                                        const isSelected = currentAtt.statusId === status.id;
                                                        
                                                        // Resolve tailwind-friendly colors dynamically
                                                        let colorClass = "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 border-transparent";
                                                        if (isSelected) {
                                                            if (status.color?.includes('green')) colorClass = "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800";
                                                            else if (status.color?.includes('red')) colorClass = "bg-red-50 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800";
                                                            else if (status.color?.includes('amber') || status.color?.includes('orange')) colorClass = "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800";
                                                            else if (status.color?.includes('blue')) colorClass = "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800";
                                                            else colorClass = "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-800";
                                                        }

                                                        return (
                                                            <button
                                                                key={status.id}
                                                                onClick={() => handleStatusChange(student.studentId, status.id)}
                                                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${colorClass} ${!isSelected ? 'hover:scale-105 active:scale-95' : ''}`}
                                                            >
                                                                {status.label}
                                                            </button>
                                                        );
                                                    })}

                                                    <input 
                                                        type="text" 
                                                        placeholder="Opt. remarks..."
                                                        value={currentAtt.remarks}
                                                        onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                                                        className="w-32 bg-transparent border-b border-dashed border-slate-300 dark:border-zinc-700 text-xs px-2 py-2 focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex justify-end">
                                    <button 
                                        onClick={handleSave} 
                                        disabled={saving}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Recording...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Submit Register
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
