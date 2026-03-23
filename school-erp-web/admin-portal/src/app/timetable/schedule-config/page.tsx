"use client";

import { useState, useEffect } from "react";
import { WorkingDayService, PeriodBlockService } from "@/lib/api";
import { Plus, Trash2, Clock, Calendar, ToggleLeft, ToggleRight, RefreshCw, AlertTriangle, X } from "lucide-react";

interface WorkingDay { id: string; dayName: string; dayOrder: number; isActive: boolean; }
interface PeriodBlock { id: string; blockName: string; blockType: string; startTime: string; endTime: string; orderIndex: number; }

type ConfirmAction = {
    title: string;
    description: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => Promise<void>;
} | null;

const BLOCK_TYPES = ["PERIOD", "BREAK", "LUNCH"];

// Auto-compute end time given a start time and duration in minutes
function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
const BLOCK_COLORS: Record<string, string> = {
    PERIOD: "bg-blue-50 border-blue-200 text-blue-800",
    BREAK: "bg-amber-50 border-amber-200 text-amber-800",
    LUNCH: "bg-green-50 border-green-200 text-green-800",
};

export default function ScheduleConfigPage() {
    const [days, setDays] = useState<WorkingDay[]>([]);
    const [blocks, setBlocks] = useState<PeriodBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDayForm, setShowDayForm] = useState(false);
    const [showBlockForm, setShowBlockForm] = useState(false);
    const [editingBlock, setEditingBlock] = useState<PeriodBlock | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [newDay, setNewDay] = useState({ dayName: "MONDAY", dayOrder: 1, isActive: true });
    const [newBlock, setNewBlock] = useState({ blockName: "", blockType: "PERIOD", startTime: "09:00", endTime: "09:45", orderIndex: 1 });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [daysData, blocksData] = await Promise.all([
                WorkingDayService.getAll(), PeriodBlockService.getAll()
            ]);
            setDays(daysData);
            setBlocks(blocksData);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const runConfirm = async () => {
        if (!confirmAction) return;
        setConfirmLoading(true);
        try {
            await confirmAction.onConfirm();
            setConfirmAction(null);
        } catch (e: any) {
            alert(`Operation failed: ${e?.message || "Unknown error. Check if this item is referenced by a timetable."}`);
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleToggleDay = async (day: WorkingDay) => {
        try {
            const updated = await WorkingDayService.toggle(day.id, !day.isActive);
            setDays(prev => prev.map(d => d.id === day.id ? updated : d));
        } catch { alert("Failed to toggle day. Please try again."); }
    };

    const promptDeleteDay = (day: WorkingDay) => {
        setConfirmAction({
            title: `Delete "${day.dayName}"?`,
            description: `This will permanently remove this working day. Any timetable that references it may become invalid.`,
            confirmLabel: "Delete",
            danger: true,
            onConfirm: async () => {
                await WorkingDayService.delete(day.id);
                setDays(prev => prev.filter(d => d.id !== day.id));
            },
        });
    };

    const handleCreateDay = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await WorkingDayService.create(newDay);
            setDays(prev => [...prev, created].sort((a, b) => a.dayOrder - b.dayOrder));
            setShowDayForm(false);
            setNewDay({ dayName: "MONDAY", dayOrder: 1, isActive: true });
        } catch { alert("Failed to create working day."); }
    };

    const handleSaveBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBlock) {
                const updated = await PeriodBlockService.update(editingBlock.id, newBlock);
                setBlocks(prev => prev.map(b => b.id === editingBlock.id ? updated : b).sort((a, b) => a.orderIndex - b.orderIndex));
            } else {
                const created = await PeriodBlockService.create(newBlock);
                setBlocks(prev => [...prev, created].sort((a, b) => a.orderIndex - b.orderIndex));
            }
            setShowBlockForm(false);
            setEditingBlock(null);
            setNewBlock({ blockName: "", blockType: "PERIOD", startTime: "09:00", endTime: "09:45", orderIndex: 1 });
        } catch (e: any) {
            alert(`Failed to save period block: ${e?.message || "Please check the backend."}`);
        }
    };

    const handleEditBlock = (block: PeriodBlock) => {
        setEditingBlock(block);
        setNewBlock({ blockName: block.blockName, blockType: block.blockType, startTime: block.startTime, endTime: block.endTime, orderIndex: block.orderIndex });
        setShowBlockForm(true);
    };

    const promptDeleteBlock = (block: PeriodBlock) => {
        setConfirmAction({
            title: `Delete "${block.blockName}"?`,
            description: `This will remove the period block (${block.startTime} – ${block.endTime}). Timetable slots using this block may be affected.`,
            confirmLabel: "Delete",
            danger: true,
            onConfirm: async () => {
                await PeriodBlockService.delete(block.id);
                setBlocks(prev => prev.filter(b => b.id !== block.id));
            },
        });
    };

    const promptResetAll = () => {
        setConfirmAction({
            title: "Reset All Schedule Config?",
            description: `This will permanently DELETE all ${days.length} working day(s) and ${blocks.length} period block(s). Generated timetable slots may break. This action cannot be undone.`,
            confirmLabel: "Reset Everything",
            danger: true,
            onConfirm: async () => {
                // Delete one by one — sequential to avoid race conditions
                for (const d of days) {
                    await WorkingDayService.delete(d.id);
                }
                for (const b of blocks) {
                    await PeriodBlockService.delete(b.id);
                }
                setDays([]);
                setBlocks([]);
            },
        });
    };

    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Schedule Configuration</h2>
                        <p className="text-muted-foreground mt-1">Configure working days and period blocks for your school.</p>
                    </div>
                    <button
                        onClick={promptResetAll}
                        disabled={days.length === 0 && blocks.length === 0}
                        className="flex items-center gap-2 border border-red-200 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-40"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset All Config
                    </button>
                </div>

                {/* Working Days */}
                <div className="bg-card border border-border rounded-xl shadow-sm">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Working Days</h3>
                            <span className="text-xs text-muted-foreground ml-1">({days.length} configured)</span>
                        </div>
                        <button onClick={() => setShowDayForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            <Plus className="w-4 h-4" /> Add Day
                        </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {days.map(day => (
                            <div key={day.id} className={`flex items-center justify-between p-3 border rounded-lg transition-all ${day.isActive ? "border-blue-200 bg-blue-50" : "border-border bg-muted/30"}`}>
                                <div>
                                    <p className="font-medium text-sm">{day.dayName}</p>
                                    <p className="text-xs text-muted-foreground">Order: {day.dayOrder}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleToggleDay(day)} className="text-muted-foreground hover:text-primary transition-colors">
                                        {day.isActive ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button onClick={() => promptDeleteDay(day)} className="text-destructive hover:opacity-70">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {days.length === 0 && <p className="col-span-3 text-muted-foreground text-sm text-center py-6">No working days configured yet.</p>}
                    </div>
                </div>

                {/* Period Blocks */}
                <div className="bg-card border border-border rounded-xl shadow-sm">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Period Blocks</h3>
                            <span className="text-xs text-muted-foreground ml-1">({blocks.length} configured)</span>
                        </div>
                        <button onClick={() => { setEditingBlock(null); setNewBlock({ blockName: "", blockType: "PERIOD", startTime: "09:00", endTime: "09:45", orderIndex: blocks.length + 1 }); setShowBlockForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            <Plus className="w-4 h-4" /> Add Block
                        </button>
                    </div>
                    <div className="divide-y divide-border">
                        {blocks.map(block => (
                            <div key={block.id} className="flex items-center justify-between px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${BLOCK_COLORS[block.blockType] || "bg-gray-50 border-gray-200"}`}>{block.blockType}</span>
                                    <div>
                                        <p className="font-medium text-sm">{block.blockName}</p>
                                        <p className="text-xs text-muted-foreground">{block.startTime} – {block.endTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditBlock(block)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">Edit</button>
                                    <button onClick={() => promptDeleteBlock(block)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        {blocks.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">No period blocks configured yet.</p>}
                    </div>
                </div>
            </div>

            {/* ── Add Day Modal ── */}
            {showDayForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add Working Day</h3>
                        <form onSubmit={handleCreateDay} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Day Name</label>
                                <select value={newDay.dayName} onChange={e => setNewDay({ ...newDay, dayName: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Day Order</label>
                                <input type="number" min={1} max={7} value={newDay.dayOrder} onChange={e => setNewDay({ ...newDay, dayOrder: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowDayForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Add/Edit Block Modal ── */}
            {showBlockForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">{editingBlock ? "Edit" : "Add"} Period Block</h3>
                        <form onSubmit={handleSaveBlock} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Block Name</label>
                                <input required value={newBlock.blockName} onChange={e => setNewBlock({ ...newBlock, blockName: e.target.value })} placeholder="Period 1" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Type</label>
                                <select value={newBlock.blockType} onChange={e => setNewBlock({ ...newBlock, blockType: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Start</label>
                                    <input type="time" required value={newBlock.startTime} onChange={e => {
                                        const st = e.target.value;
                                        const et = addMinutes(st, 45);
                                        setNewBlock({ ...newBlock, startTime: st, endTime: et });
                                    }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">End</label>
                                    <input type="time" required value={newBlock.endTime} onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Order Index</label>
                                <input type="number" min={1} required value={newBlock.orderIndex} onChange={e => setNewBlock({ ...newBlock, orderIndex: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setShowBlockForm(false); setEditingBlock(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Confirmation Dialog ── */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${confirmAction.danger ? "bg-red-100" : "bg-amber-100"}`}>
                                <AlertTriangle className={`w-5 h-5 ${confirmAction.danger ? "text-red-600" : "text-amber-600"}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">{confirmAction.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{confirmAction.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2 border-t border-border">
                            <button
                                disabled={confirmLoading}
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={confirmLoading}
                                onClick={runConfirm}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 ${confirmAction.danger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-primary text-primary-foreground hover:bg-blue-600"}`}
                            >
                                {confirmLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                                {confirmLoading ? "Working..." : confirmAction.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
