"use client";

import { useState, useEffect, useCallback } from "react";
import { TimetableService, ClassService, StaffService, ClassSubjectTeacherService, RoomService, WorkingDayService, PeriodBlockService } from "@/lib/api";
import { Plus, Zap, Calendar, CheckCircle, CheckCircle2, AlertTriangle, Lock, Unlock, Pencil, Trash2, X, Printer, Download } from "lucide-react";
import { generateFlowPDF } from "@/lib/pdfGenerator";

interface Timetable { id: string; academicYear: string; term: string; status: string; }
interface TimetableSlot { id: string; classId: string; className: string; dayId: string; dayName: string; dayOrder: number; blockId: string; blockName: string; startTime: string; endTime: string; subjectId: string; subjectName: string; teacherId: string; teacherName: string; roomId: string; roomName: string; isLocked: boolean; classSubjectTeacherId: string; isLab: boolean; }
interface SchoolClass { id: string; name: string; }
interface Staff { id: string; name: string; }
interface Assignment { id: string; subjectId: string; subjectName: string; teacherId: string; teacherName: string; }
interface Room { id: string; roomName: string; }
interface FreeCell { dayId: string; dayName: string; blockId: string; blockName: string; }

type ViewMode = "class" | "teacher";

export default function TimetablePage() {
    const [timetables, setTimetables] = useState<Timetable[]>([]);
    const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
    const [slots, setSlots] = useState<TimetableSlot[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    // Generator Config
    const [isClassTeacherFirstPeriod, setIsClassTeacherFirstPeriod] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("class");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
    const [addingCell, setAddingCell] = useState<FreeCell | null>(null);
    const [editAssignments, setEditAssignments] = useState<Assignment[]>([]);
    const [generalResult, setGeneralResult] = useState<{ success: boolean; message: string; conflicts: string[] } | null>(null);
    const [newTimetable, setNewTimetable] = useState({ academicYear: "2025-2026", term: "Term 1" });
    const [editForm, setEditForm] = useState({ classSubjectTeacherId: "", roomId: "" });
    const [addForm, setAddForm] = useState({ classId: "", classSubjectTeacherId: "", roomId: "" });

    const [workingDays, setWorkingDays] = useState<any[]>([]);
    const [periodBlocks, setPeriodBlocks] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [tt, cls, stf, rm, days, blocks] = await Promise.all([
                    TimetableService.getAll(), ClassService.getAll(), StaffService.getAll(), RoomService.getAll(),
                    WorkingDayService.getAll(), PeriodBlockService.getAll()
                ]);
                setTimetables(tt); setClasses(cls); setStaff(stf); setRooms(rm);
                setWorkingDays(days.filter((d: any) => d.isActive).sort((a: any, b: any) => a.dayOrder - b.dayOrder));
                setPeriodBlocks(blocks.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const loadSlots = useCallback(async (timetableId: string) => {
        if (viewMode === "class" && selectedClass) {
            const data = await TimetableService.getByClass(timetableId, selectedClass);
            setSlots(data);
        } else if (viewMode === "teacher" && selectedTeacher) {
            const data = await TimetableService.getByTeacher(timetableId, selectedTeacher);
            setSlots(data);
        } else {
            const data = await TimetableService.getAllSlots(timetableId);
            setSlots(data);
        }
    }, [viewMode, selectedClass, selectedTeacher]);

    useEffect(() => {
        if (selectedTimetable) loadSlots(selectedTimetable.id);
    }, [selectedTimetable, selectedClass, selectedTeacher, loadSlots]);

    const handleCreateTimetable = async (e: React.FormEvent) => {
        e.preventDefault();
        const created = await TimetableService.create(newTimetable);
        setTimetables([created, ...timetables]);
        setSelectedTimetable(created);
        setShowCreateForm(false);
    };

    const handleDeleteTimetable = async () => {
        if (!selectedTimetable) return;
        if (!confirm(`Delete timetable "${selectedTimetable.academicYear} — ${selectedTimetable.term}"? This cannot be undone.`)) return;
        try {
            await TimetableService.deleteTimetable(selectedTimetable.id);
            const remaining = timetables.filter(t => t.id !== selectedTimetable.id);
            setTimetables(remaining);
            setSelectedTimetable(remaining[0] || null);
            setSlots([]);
        } catch { alert("Could not delete timetable."); }
    };

    const handleGenerate = async () => {
        if (!selectedTimetable) return;
        setGenerating(true);
        setGeneralResult(null);
        try {
            const result = await TimetableService.generate(selectedTimetable.id, isClassTeacherFirstPeriod);
            setGeneralResult(result);
            if (result.success) {
                await loadSlots(selectedTimetable.id);
            }
        } catch (error: any) { 
            setGeneralResult({ 
                success: false, 
                message: error.message || "Generation failed. Check backend configuration.", 
                conflicts: [] 
            }); 
        } finally { 
            setGenerating(false); 
        }
    };

    const handlePublish = async () => {
        if (!selectedTimetable) return;
        const updated = await TimetableService.publish(selectedTimetable.id);
        setTimetables(timetables.map(t => t.id === updated.id ? updated : t));
        setSelectedTimetable(updated);
    };

    const handleOpenEdit = async (slot: TimetableSlot) => {
        setEditingSlot(slot);
        setEditForm({ classSubjectTeacherId: slot.classSubjectTeacherId, roomId: slot.roomId || "" });
        const assignments = await ClassSubjectTeacherService.getByClass(slot.classId);
        setEditAssignments(assignments);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSlot) return;
        try {
            await TimetableService.updateSlot(editingSlot.id, editForm);
            await loadSlots(selectedTimetable!.id);
            setEditingSlot(null);
        } catch (e: any) { alert(e.message || "Could not update slot."); }
    };

    const handleDeleteSlot = async (slot: TimetableSlot) => {
        if (slot.isLocked) { alert("Unlock the slot before deleting."); return; }
        if (!confirm(`Delete ${slot.subjectName} on ${slot.dayName} / ${slot.blockName}?`)) return;
        try {
            await TimetableService.deleteSlot(slot.id);
            await loadSlots(selectedTimetable!.id);
        } catch { alert("Could not delete slot."); }
    };

    const handleToggleLock = async (slot: TimetableSlot) => {
        await TimetableService.toggleLock(slot.id);
        await loadSlots(selectedTimetable!.id);
    };

    const handleOpenAddCell = async (cell: FreeCell) => {
        setAddingCell(cell);
        setAddForm({ classId: selectedClass || classes[0]?.id || "", classSubjectTeacherId: "", roomId: "" });
        if (selectedClass || classes[0]?.id) {
            const assignments = await ClassSubjectTeacherService.getByClass(selectedClass || classes[0].id);
            setEditAssignments(assignments);
        }
    };

    const handleAddClassChange = async (classId: string) => {
        setAddForm(f => ({ ...f, classId, classSubjectTeacherId: "" }));
        const assignments = await ClassSubjectTeacherService.getByClass(classId);
        setEditAssignments(assignments);
    };

    const handleSaveAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addingCell || !selectedTimetable) return;
        try {
            await TimetableService.createSlot({
                timetableId: selectedTimetable.id,
                classId: addForm.classId,
                dayId: addingCell.dayId,
                blockId: addingCell.blockId,
                classSubjectTeacherId: addForm.classSubjectTeacherId,
                roomId: addForm.roomId || null,
            });
            await loadSlots(selectedTimetable.id);
            setAddingCell(null);
        } catch (e: any) { alert(e.message || "Could not add slot."); }
    };

    // Build the grid structure from flat slots
    const buildGrid = () => {
        const slotMap = new Map<string, TimetableSlot>(); // "dayId|blockId" → slot

        slots.forEach(s => {
            const key = s.dayId + "|" + s.blockId;
            if (slotMap.has(key)) {
                const existing = slotMap.get(key)!;
                if (existing.subjectId === s.subjectId) {
                    if (s.roomName && existing.roomName !== s.roomName && !(existing.roomName || "").includes(s.roomName)) {
                        existing.roomName = existing.roomName ? existing.roomName + " / " + s.roomName : s.roomName;
                    }
                    if (s.teacherName && existing.teacherName !== s.teacherName && !(existing.teacherName || "").includes(s.teacherName)) {
                        existing.teacherName = existing.teacherName ? existing.teacherName + " / " + s.teacherName : s.teacherName;
                    }
                    if (s.className && existing.className !== s.className && !(existing.className || "").includes(s.className)) {
                        existing.className = existing.className ? existing.className + " / " + s.className : s.className;
                    }
                }
            } else {
                slotMap.set(key, { ...s });
            }
        });

        return { slotMap };
    };

    const downloadFlowGuide = () => {
        generateFlowPDF({
            featureName: "Timetable Generation",
            description: "The Timetable Generator runs an intelligent placement algorithm. It detects un-scheduled 'Subject Requirements' for a class and attempts to find a combination of Teacher availability and Room availability to lock in a slot.",
            steps: [
                {
                    title: "Check Subject Mappings",
                    description: "Ensure the Class you want to schedule has Subjects mapped to it (via the Classes tab).",
                    example: "Class 10A has 'Science Practical'."
                },
                {
                    title: "Click Generate Algorithm",
                    description: "Clicking the 'lightning' icon kicks off the algorithm. It processes class limitations, teacher unavailability schedules, and room requirement conflicts.",
                    example: "The engine sees 'Science Practical' requires the 'Science Labs' Batch."
                },
                {
                    title: "Room Locking (Batching)",
                    description: "If a subject requires a single Room Type, it reserves one available room. If it requires a Lab Group, it searches for a time block where ALL rooms in the group are empty, then reserves them simultaneously.",
                    example: "The system finds Period 2 empty. It places 'Science Practical' for Class 10A into both 'Physics Lab' AND 'Chemistry Lab' exactly at Period 2."
                },
                {
                    title: "Manual Overrides & Publishing",
                    description: "You can click any blank cell to manually assign a slot, or click a scheduled slot to override/delete it. Once complete, click Publish.",
                    example: "Clicking 'Publish' finalizes the Term 1 Timetable."
                }
            ]
        });
    };

    const { slotMap } = buildGrid();

    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-timetable, #printable-timetable * { visibility: visible; }
                    #printable-timetable { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none; box-shadow: none; }
                    #printable-timetable button { display: none !important; }
                    @page { size: landscape; margin: 10mm; }
                }
            `}</style>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Timetable Manager</h2>
                        <p className="text-muted-foreground mt-1">Generate and manage class timetables.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedTimetable?.status === "DRAFT" && (
                            <button onClick={handlePublish} className="flex items-center gap-2 border border-green-300 text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                                <CheckCircle className="w-4 h-4" /> Publish
                            </button>
                        )}
                        {selectedTimetable?.status === "PUBLISHED" && (
                            <button onClick={() => window.print()} className="flex items-center gap-2 border border-blue-300 text-blue-700 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                                <Printer className="w-4 h-4" /> Print
                            </button>
                        )}
                        {selectedTimetable && (
                            <>
                                <button onClick={downloadFlowGuide} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">
                                <Download className="w-4 h-4" /> Usage Guide
                            </button>
                            
                            {/* Hide generate button unless in Class View with a Class Selected */}
                            {viewMode === "class" && selectedClass && (
                                <div className="flex items-center gap-3 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
                                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                            checked={isClassTeacherFirstPeriod}
                                            onChange={(e) => setIsClassTeacherFirstPeriod(e.target.checked)}
                                        />
                                        First hr will be class teacher
                                    </label>
                                    <button
                                        onClick={handleGenerate} disabled={generating || selectedTimetable.status === "PUBLISHED"}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
                                    >
                                        <Zap className="w-4 h-4" /> {generating ? "Generating..." : "Generate Algorithm"}
                                    </button>
                                </div>
                            )}

                            {selectedTimetable.status !== "PUBLISHED" && (
                                <button
                                    onClick={handlePublish}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Publish Final
                                </button>
                            )}
                                <button onClick={handleDeleteTimetable} title="Delete this timetable" className="flex items-center gap-1.5 border border-red-200 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            <Plus className="w-4 h-4" /> New Timetable
                        </button>
                    </div>
                </div>

                {/* Generation Result Banner */}
                {generalResult && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${generalResult.success ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                        {generalResult.success ? <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                            <p className="font-medium">{generalResult.message}</p>
                            {generalResult.conflicts.length > 0 && (
                                <ul className="mt-2 text-xs space-y-0.5">
                                    {generalResult.conflicts.slice(0, 5).map((c, i) => <li key={i}>• {c}</li>)}
                                    {generalResult.conflicts.length > 5 && <li>...and {generalResult.conflicts.length - 5} more.</li>}
                                </ul>
                            )}
                        </div>
                        <button onClick={() => setGeneralResult(null)} className="text-muted-foreground hover:text-foreground text-xs">dismiss</button>
                    </div>
                )}

                {/* Controls Row */}
                <div className="flex flex-wrap items-center gap-3">
                    <select value={selectedTimetable?.id || ""} onChange={e => {
                        const t = timetables.find(t => t.id === e.target.value) || null;
                        setSelectedTimetable(t);
                        setSlots([]);
                    }} className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Select timetable...</option>
                        {timetables.map(t => <option key={t.id} value={t.id}>{t.academicYear} — {t.term} [{t.status}]</option>)}
                    </select>

                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                        <button onClick={() => setViewMode("class")} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === "class" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>Class View</button>
                        <button onClick={() => setViewMode("teacher")} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === "teacher" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>Teacher View</button>
                    </div>

                    {viewMode === "class" && (
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">All classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    {viewMode === "teacher" && (
                        <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Select teacher...</option>
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    )}

                    {selectedTimetable && (
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold border ${selectedTimetable.status === "PUBLISHED" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {selectedTimetable.status}
                        </span>
                    )}
                </div>

                {/* Timetable Grid */}
                {!selectedTimetable ? (
                    <div className="bg-card border border-border rounded-xl p-16 text-center text-muted-foreground">
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Select or create a timetable to get started.</p>
                        <p className="text-sm mt-1">Then configure your working days and period blocks, assign subjects, and click Generate.</p>
                    </div>
                ) : slots.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-16 text-center text-muted-foreground">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No timetable slots yet.</p>
                        <p className="text-sm mt-1">Click &quot;Generate Timetable&quot; to auto-schedule, or add individual entries.</p>
                    </div>
                ) : (
                    <div id="printable-timetable" className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                        <table className="table-fixed w-full text-xs border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <th className="p-3 text-left font-semibold w-32">Block</th>
                                    {workingDays.map(d => (
                                        <th key={d.id} className="p-3 text-center font-semibold min-w-[130px]">{d.dayName}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {periodBlocks.map((block, bi) => {
                                    const isBreak = block.blockType === "BREAK" || block.blockType === "LUNCH";
                                    return (
                                        <tr key={block.id} className={bi % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                                            <td className="p-2 border-r border-border">
                                                <p className={`font-semibold ${isBreak ? (block.blockType === "LUNCH" ? "text-green-600" : "text-amber-600") : "text-foreground"}`}>{block.blockName}</p>
                                                <p className="text-muted-foreground text-[10px]">{block.startTime}–{block.endTime}</p>
                                            </td>
                                            {isBreak ? (
                                                <td colSpan={workingDays.length} className={`p-4 text-center font-bold tracking-widest ${block.blockType === "LUNCH" ? "text-green-600/60 bg-green-50/40" : "text-amber-600/60 bg-amber-50/40"} uppercase`}>
                                                    {block.blockName}
                                                </td>
                                            ) : (
                                                workingDays.map(day => {
                                                    const slot = slotMap.get(day.id + "|" + block.id);
                                                    return (
                                                        <td key={day.id} className="p-1.5 border-r border-border align-top">
                                                            {slot ? (
                                                                <div className={`rounded-lg p-2 transition-all group relative ${
                                                                    slot.isLocked 
                                                                        ? "bg-indigo-50 border border-indigo-200" 
                                                                        : slot.isLab 
                                                                            ? "bg-purple-50 border border-purple-200 hover:border-purple-400" 
                                                                            : "bg-blue-50 border border-blue-100 hover:border-blue-300"
                                                                }`}>
                                                                    <div className="flex items-start justify-between gap-1">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                                <p className={`font-semibold truncate ${slot.isLab ? "text-purple-900" : "text-blue-900"}`}>{slot.subjectName}</p>
                                                                                {slot.isLab && <span className="inline-flex flex-shrink-0 px-1 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded uppercase tracking-wider border border-purple-200">LAB</span>}
                                                                            </div>
                                                                            <p className={`text-[10px] truncate ${slot.isLab ? "text-purple-700" : "text-blue-600"}`}>{slot.teacherName || "—"}</p>
                                                                            {slot.roomName && <p className={`text-[10px] truncate ${slot.isLab ? "text-purple-600" : "text-blue-500"}`}>📍 {slot.roomName}</p>}
                                                                            {viewMode === "teacher" && <p className="text-[10px] text-indigo-600 truncate">🏛 {slot.className}</p>}
                                                                        </div>
                                                                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => handleToggleLock(slot)} title={slot.isLocked ? "Unlock" : "Lock"} className="text-muted-foreground hover:text-foreground">
                                                                                {slot.isLocked ? <Lock className="w-3 h-3 text-indigo-500" /> : <Unlock className="w-3 h-3" />}
                                                                            </button>
                                                                            <button onClick={() => handleOpenEdit(slot)} title="Edit slot" className="text-muted-foreground hover:text-blue-600">
                                                                                <Pencil className="w-3 h-3" />
                                                                            </button>
                                                                            <button onClick={() => handleDeleteSlot(slot)} title="Delete slot" className="text-muted-foreground hover:text-red-600">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleOpenAddCell({ dayId: day.id, dayName: day.dayName, blockId: block.id, blockName: block.blockName })}
                                                                    className="w-full h-14 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-500 transition-all group"
                                                                    title={`Add entry: ${day.dayName} · ${block.blockName}`}
                                                                >
                                                                    <span className="text-[10px] group-hover:hidden">free</span>
                                                                    <Plus className="w-3 h-3 hidden group-hover:block" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    );
                                                })
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        <div className="flex justify-end mt-4">
                            <button onClick={downloadFlowGuide} className="flex items-center gap-2 text-sm text-primary hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 transition-colors">
                                <Download className="w-4 h-4" /> Download UI Flow Guide (PDF)
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Timetable Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">New Timetable</h3>
                        <form onSubmit={handleCreateTimetable} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Academic Year</label>
                                <input required value={newTimetable.academicYear} onChange={e => setNewTimetable({ ...newTimetable, academicYear: e.target.value })} placeholder="2025-2026" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Term</label>
                                <input required value={newTimetable.term} onChange={e => setNewTimetable({ ...newTimetable, term: e.target.value })} placeholder="Term 1" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Slot Modal */}
            {editingSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold">Edit Slot</h3>
                            <button onClick={() => setEditingSlot(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{editingSlot.dayName} · {editingSlot.blockName} · {editingSlot.className}</p>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject — Teacher Assignment</label>
                                <select value={editForm.classSubjectTeacherId} onChange={e => setEditForm({ ...editForm, classSubjectTeacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select assignment...</option>
                                    {editAssignments.map((a: any) => <option key={a.id} value={a.id}>{a.subjectName} — {a.teacherName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Room</label>
                                <select value={editForm.roomId} onChange={e => setEditForm({ ...editForm, roomId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">No room</option>
                                    {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.roomName}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                <button type="button" onClick={() => setEditingSlot(null)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Add Entry Modal */}
            {addingCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold">Add Entry</h3>
                            <button onClick={() => setAddingCell(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{addingCell.dayName} · {addingCell.blockName}</p>
                        <form onSubmit={handleSaveAdd} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Class</label>
                                <select required value={addForm.classId} onChange={e => handleAddClassChange(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select class...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject — Teacher</label>
                                <select required value={addForm.classSubjectTeacherId} onChange={e => setAddForm({ ...addForm, classSubjectTeacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select assignment...</option>
                                    {editAssignments.map((a: any) => <option key={a.id} value={a.id}>{a.subjectName} — {a.teacherName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Room <span className="text-muted-foreground font-normal">(optional)</span></label>
                                <select value={addForm.roomId} onChange={e => setAddForm({ ...addForm, roomId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">No room</option>
                                    {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.roomName}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                <button type="button" onClick={() => setAddingCell(null)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Add Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
