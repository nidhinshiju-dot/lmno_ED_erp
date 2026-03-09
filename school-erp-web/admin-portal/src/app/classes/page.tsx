"use client";

import React, { useEffect, useState } from "react";
import { ClassService } from "@/lib/api";
import { Plus, Search, Layers, Loader2, GraduationCap, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";

interface SchoolClass {
    id: string;
    name: string;
    academicYear: string;
    gradeLevel: number;
    branch: string | null;
    capacity?: number;
    roomNumber?: string;
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newClass, setNewClass] = useState({
        name: "",
        academicYear: "ay-2025",
        gradeLevel: "",
        branch: "",
        capacity: 40,
        roomNumber: "",
    });

    useEffect(() => {
        fetchClassesAndSections();
    }, []);

    const fetchClassesAndSections = async () => {
        try {
            const classData = await ClassService.getAll();

            // Sort by grade level, then by name
            const sortedData = [...classData].sort((a, b) => {
                if (a.gradeLevel !== b.gradeLevel) {
                    return (a.gradeLevel || 0) - (b.gradeLevel || 0);
                }
                return a.name.localeCompare(b.name);
            });
            setClasses(sortedData);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch classes structure.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newClass,
                gradeLevel: newClass.gradeLevel ? parseInt(newClass.gradeLevel) : null,
                branch: newClass.branch.trim() || null
            };
            const res = await ClassService.create(payload);
            setClasses(prev => [...prev, res].sort((a, b) => (a.gradeLevel || 0) - (b.gradeLevel || 0)));
            setIsModalOpen(false);
            setNewClass({ name: "", academicYear: "ay-2025", gradeLevel: "", branch: "", capacity: 40, roomNumber: "" });
        } catch {
            alert("Failed to create class block");
        }
    };

    const handleDeleteClass = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
        try {
            await ClassService.delete(id);
            setClasses(prev => prev.filter(c => c.id !== id));
        } catch {
            alert("Failed to delete class.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Classes & Branches</h2>
                    <p className="text-muted-foreground mt-1">Manage grade levels and structural branches for higher secondary.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" /> Create Class
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search class names or branches..."
                        className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading structural catalog...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center text-red-400 bg-red-500/5 rounded-xl border border-red-500/20">
                    <Layers className="w-10 h-10 mx-auto text-red-400 mb-3 opacity-50" />
                    {error}
                </div>
            ) : classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border border-dashed">
                    <Layers className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No classes defined</h3>
                    <p className="text-muted-foreground text-sm mt-1 max-w-sm text-center">There are no classes or branches set up for this tenant.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-6 text-primary text-sm font-medium hover:underline">
                        + Initialize Classes
                    </button>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-muted-foreground">Class Profile</th>
                                <th className="p-4 font-semibold text-muted-foreground">Grade Level</th>
                                <th className="p-4 font-semibold text-muted-foreground">Branch / Stream</th>
                                <th className="p-4 font-semibold text-muted-foreground">Capacity</th>
                                <th className="p-4 font-semibold text-muted-foreground">Division</th>
                                <th className="p-4 font-semibold text-muted-foreground">Academic Year</th>
                                <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {classes.map(cls => (
                                <React.Fragment key={cls.id}>
                                    <tr className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 whitespace-nowrap font-medium text-foreground flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            {cls.name}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm">
                                                {cls.gradeLevel ?? "-"}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {cls.branch ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    {cls.branch}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">General / NA</span>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {cls.capacity || "-"}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {cls.roomNumber ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                    Div {cls.roomNumber}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-muted-foreground">
                                            {cls.academicYear}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/classes/${cls.id}`}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Manage Subjects"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Class"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Layers className="text-primary w-5 h-5" /> Add Class / Branch</h3>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Class Name *</label>
                                <input required type="text" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Plus One Commerce, Class 8" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block flex items-center justify-between">
                                        Grade Level * <span className="text-[10px] text-muted-foreground font-normal ml-1">(Numeric)</span>
                                    </label>
                                    <input required type="number" min="1" max="15" value={newClass.gradeLevel} onChange={e => setNewClass({ ...newClass, gradeLevel: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 11" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Academic Year *</label>
                                    <input required type="text" value={newClass.academicYear} onChange={e => setNewClass({ ...newClass, academicYear: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ay-2025" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block flex items-center justify-between">
                                    Branch / Stream <span className="text-[10px] text-muted-foreground font-normal ml-1">(Optional)</span>
                                </label>
                                <input type="text" value={newClass.branch} onChange={e => setNewClass({ ...newClass, branch: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Science, Commerce, Humanities" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Capacity *</label>
                                    <input required type="number" min="1" max="200" value={newClass.capacity} onChange={e => setNewClass({ ...newClass, capacity: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Division <span className="text-[10px] text-muted-foreground font-normal ml-1">(Optional — e.g. A, B)</span></label>
                                    <input type="text" value={newClass.roomNumber} onChange={e => setNewClass({ ...newClass, roomNumber: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. A, B, C" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg transition-colors relative">
                                    Create Block
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
