"use client";

import { useState, useEffect } from "react";
import { SubstitutionService, TimetableService, StaffService, ClassService, PeriodBlockService } from "@/lib/api";
import { UserX, UserCheck, RefreshCw } from "lucide-react";

interface Substitution { id: string; date: string; classId: string; className: string; blockId: string; blockName: string; subjectName: string; originalTeacherId: string; originalTeacherName: string; substituteTeacherId: string; substituteTeacherName: string; status: string; reason: string; }
interface Suggestion { teacherId: string; teacherName: string; email: string; }
interface Timetable { id: string; academicYear: string; term: string; status: string; }
interface Staff { id: string; name: string; }
interface SchoolClass { id: string; name: string; }
interface PeriodBlock { id: string; blockName: string; blockType: string; }

const STATUS_STYLES: Record<string, string> = {
    SUGGESTED: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function SubstitutionsPage() {
    const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [timetables, setTimetables] = useState<Timetable[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [blocks, setBlocks] = useState<PeriodBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [newSub, setNewSub] = useState({ classId: "", blockId: "", originalTeacherId: "", reason: "", subjectId: "" });
    const [selectedTimetableId, setSelectedTimetableId] = useState("");
    const [suggestContext, setSuggestContext] = useState<{ substitutionId: string; blockId: string } | null>(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [stf, cls, blk, tt] = await Promise.all([
                    StaffService.getAll(), ClassService.getAll(), PeriodBlockService.getAll(), TimetableService.getAll()
                ]);
                setStaff(stf); setClasses(cls); setBlocks(blk.filter((b: PeriodBlock) => b.blockType === "PERIOD")); setTimetables(tt);
                if (tt.length > 0) setSelectedTimetableId(tt[0].id);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            SubstitutionService.getByDate(selectedDate).then(setSubstitutions).catch(console.error);
        }
    }, [selectedDate]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await SubstitutionService.create({ ...newSub, date: selectedDate });
        const updated = await SubstitutionService.getByDate(selectedDate);
        setSubstitutions(updated);
        setShowCreateForm(false);
        setNewSub({ classId: "", blockId: "", originalTeacherId: "", reason: "", subjectId: "" });
    };

    const handleSuggest = async (sub: Substitution) => {
        if (!selectedTimetableId) { alert("Select a timetable first."); return; }
        setSuggestContext({ substitutionId: sub.id, blockId: sub.blockId });
        setLoadingSuggestions(true);
        setShowSuggestions(true);
        try {
            const result = await SubstitutionService.suggest(selectedTimetableId, sub.originalTeacherId, sub.blockId, selectedDate);
            setSuggestions(result);
        } catch { setSuggestions([]); }
        finally { setLoadingSuggestions(false); }
    };

    const handleConfirm = async (substituteTeacherId: string) => {
        if (!suggestContext) return;
        await SubstitutionService.confirm(suggestContext.substitutionId, substituteTeacherId);
        const updated = await SubstitutionService.getByDate(selectedDate);
        setSubstitutions(updated);
        setShowSuggestions(false);
        setSuggestContext(null);
    };

    const handleCancel = async (id: string) => {
        await SubstitutionService.cancel(id);
        const updated = await SubstitutionService.getByDate(selectedDate);
        setSubstitutions(updated);
    };

    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Substitutions</h2>
                        <p className="text-muted-foreground mt-1">Manage teacher substitutions when staff are absent.</p>
                    </div>
                    <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                        <UserX className="w-4 h-4" /> Mark Absent
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Date:</label>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <label className="text-sm font-medium">Timetable:</label>
                        <select value={selectedTimetableId} onChange={e => setSelectedTimetableId(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Select...</option>
                            {timetables.map(t => <option key={t.id} value={t.id}>{t.academicYear} — {t.term}</option>)}
                        </select>
                    </div>
                </div>

                {/* Substitutions List */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <p className="text-sm font-semibold text-muted-foreground">{substitutions.length} substitution{substitutions.length !== 1 ? "s" : ""} on {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
                    </div>

                    {substitutions.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No substitutions recorded for this date.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {substitutions.map(sub => (
                                <div key={sub.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                            <UserX className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm">{sub.originalTeacherName} <span className="text-muted-foreground font-normal">is absent</span></p>
                                            <p className="text-xs text-muted-foreground">{sub.className} · {sub.blockName} {sub.subjectName ? `· ${sub.subjectName}` : ""}</p>
                                            {sub.reason && <p className="text-xs text-muted-foreground italic">Reason: {sub.reason}</p>}
                                            {sub.substituteTeacherName && (
                                                <p className="text-xs text-green-600 font-medium mt-0.5">→ Covered by: {sub.substituteTeacherName}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[sub.status] || ""}`}>{sub.status}</span>
                                        {sub.status === "SUGGESTED" && (
                                            <button onClick={() => handleSuggest(sub)} className="flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                                <RefreshCw className="w-3 h-3" /> Find Substitute
                                            </button>
                                        )}
                                        {sub.status !== "CANCELLED" && (
                                            <button onClick={() => handleCancel(sub.id)} className="text-xs text-muted-foreground hover:text-destructive border border-border px-2.5 py-1.5 rounded-lg hover:border-red-200 transition-colors">Cancel</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mark Absent Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Mark Teacher Absent</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Teacher (Absent)</label>
                                <select required value={newSub.originalTeacherId} onChange={e => setNewSub({ ...newSub, originalTeacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select teacher...</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Class</label>
                                <select required value={newSub.classId} onChange={e => setNewSub({ ...newSub, classId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select class...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Period</label>
                                <select required value={newSub.blockId} onChange={e => setNewSub({ ...newSub, blockId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select period...</option>
                                    {blocks.map(b => <option key={b.id} value={b.id}>{b.blockName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Reason (optional)</label>
                                <input value={newSub.reason} onChange={e => setNewSub({ ...newSub, reason: e.target.value })} placeholder="Sick leave, personal..." className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg">Mark Absent</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Suggestions Modal */}
            {showSuggestions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-1">Available Substitutes</h3>
                        <p className="text-sm text-muted-foreground mb-4">Teachers free during this block:</p>
                        {loadingSuggestions ? (
                            <p className="text-center text-muted-foreground py-6">Finding available teachers...</p>
                        ) : suggestions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6">No available teachers found for this slot.</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {suggestions.map(s => (
                                    <div key={s.teacherId} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">{s.teacherName}</p>
                                            {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                                        </div>
                                        <button onClick={() => handleConfirm(s.teacherId)} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                                            <UserCheck className="w-3.5 h-3.5" /> Assign
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <button onClick={() => { setShowSuggestions(false); setSuggestContext(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
