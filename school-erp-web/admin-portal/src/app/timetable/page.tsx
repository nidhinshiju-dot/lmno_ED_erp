"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { SectionService, TimetableService, StaffService } from "@/lib/api";
import { Plus, Calendar } from "lucide-react";

interface TimetableEntry { id: string; sectionId: string; day: string; period: number; subject: string; teacherId: string; }
interface SectionItem { id: string; name: string; }
interface StaffMember { id: string; name: string; }

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablePage() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [selectedSection, setSelectedSection] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({ day: "MON", period: 1, subject: "", teacherId: "" });

    useEffect(() => {
        const load = async () => {
            try {
                const [secData, staffData] = await Promise.all([SectionService.getAll(), StaffService.getAll()]);
                setSections(secData);
                setStaffList(staffData);
            } catch { console.error("Failed to load data"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        if (!selectedSection) return;
        const loadEntries = async () => {
            try {
                const data = await TimetableService.getBySection(selectedSection);
                setEntries(data);
            } catch { console.error("Failed to load timetable"); }
        };
        loadEntries();
    }, [selectedSection]);

    const getCell = (day: string, period: number) => entries.find(e => e.day === day && e.period === period);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSection) { alert("Select a section first"); return; }
        try {
            const created = await TimetableService.create({ ...newEntry, sectionId: selectedSection });
            setEntries([...entries, created]);
            setIsModalOpen(false);
            setNewEntry({ day: "MON", period: 1, subject: "", teacherId: "" });
        } catch { alert("Failed to create entry"); }
    };

    const getTeacherName = (id: string) => staffList.find(s => s.id === id)?.name || "—";

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Timetable Management" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Timetable</h2>
                            <p className="text-muted-foreground mt-1">Manage weekly class schedules.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                            <Plus className="w-4 h-4" /> Add Entry
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Section:</label>
                        <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="p-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Select a section...</option>
                            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    {loading ? (
                        <p className="text-muted-foreground text-center py-12">Loading...</p>
                    ) : !selectedSection ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
                            Select a section to view its timetable.
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="p-3 text-left font-semibold text-muted-foreground border-b border-r border-border">Period</th>
                                        {DAYS.map(d => <th key={d} className="p-3 text-center font-semibold text-muted-foreground border-b border-r border-border">{d}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERIODS.map(p => (
                                        <tr key={p} className="border-b border-border">
                                            <td className="p-3 font-mono text-xs text-muted-foreground border-r border-border text-center font-medium">{p}</td>
                                            {DAYS.map(d => {
                                                const cell = getCell(d, p);
                                                return (
                                                    <td key={d} className="p-2 border-r border-border min-w-[120px]">
                                                        {cell ? (
                                                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                                                                <p className="font-semibold text-xs text-blue-800">{cell.subject}</p>
                                                                <p className="text-[10px] text-blue-600 mt-0.5">{getTeacherName(cell.teacherId)}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-muted-foreground text-xs py-2">—</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold mb-4">Add Timetable Entry</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Day</label>
                                    <select required value={newEntry.day} onChange={e => setNewEntry({...newEntry, day: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Period</label>
                                    <select required value={newEntry.period} onChange={e => setNewEntry({...newEntry, period: parseInt(e.target.value)})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div><label className="text-sm font-medium mb-1 block">Subject *</label>
                                <input required type="text" value={newEntry.subject} onChange={e => setNewEntry({...newEntry, subject: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mathematics" />
                            </div>
                            <div><label className="text-sm font-medium mb-1 block">Teacher</label>
                                <select value={newEntry.teacherId} onChange={e => setNewEntry({...newEntry, teacherId: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select teacher...</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Add Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
