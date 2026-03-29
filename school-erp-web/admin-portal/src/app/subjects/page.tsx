"use client";

import { useState, useEffect } from "react";
import { SubjectService } from "@/lib/api";
import { Plus, BookOpen, Search, Trash2, RefreshCw, Download, Loader2 } from "lucide-react";
import { generateFlowPDF } from "@/lib/pdfGenerator";

interface SubjectItem {
    id: string;
    name: string;
    code: string;
    description: string;
    subjectType: string;
    status: string;
}

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({
        name: "", code: "", description: "", subjectType: "CORE", status: "ACTIVE"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await SubjectService.getAll();
            setSubjects(data || []);
        } catch {
            setError("Could not connect to the backend API. Are the gateway and core-service running?");
        } finally {
            setLoading(false);
        }
    };

    const filtered = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const created = await SubjectService.create(newSubject);
            setSubjects([...subjects, created]);
            setIsModalOpen(false);
            setNewSubject({ name: "", code: "", description: "", subjectType: "CORE", status: "ACTIVE" });
        } catch {
            alert("Failed to create subject. Check that core-service is running.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This will remove it from all classes it is assigned to.`)) return;
        try {
            await SubjectService.delete(id);
            setSubjects(prev => prev.filter(s => s.id !== id));
        } catch {
            alert("Failed to delete subject. It may be assigned to active classes.");
        }
    };

    const generateCode = () => {
        if (!newSubject.name.trim()) {
            alert("Enter a subject name first to generate its code.");
            return;
        }
        const prefix = newSubject.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase().padEnd(4, "X");
        const rand = Math.floor(100 + Math.random() * 900);
        setNewSubject(prev => ({ ...prev, code: `${prefix}${rand}` }));
    };

    const downloadFlowGuide = () => {
        generateFlowPDF({
            featureName: "Global Subjects",
            description: "Subjects are global entities. Create 'Mathematics' once, then assign it to as many classes as needed.",
            steps: [
                { title: "Create the Global Subject", description: "Click 'Add Subject' to define the subject name, type, and code.", example: "Creating 'Science Practical' as a CORE subject." },
                { title: "Navigate to a Class", description: "Go to Classes, and click 'Manage Subjects' for a specific class.", example: "Opening the management page for 'Class 10A'." },
                { title: "Assign Subject to Class", description: "Select the global subject, choose a teacher, and set weekly periods.", example: "Assigning 'Science Practical' to 'Class 10A', 2 periods/week." }
            ],
            proTip: "Deleting a global subject will automatically remove it from all classes currently using it."
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page header — mirrors Students page structure exactly */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
                    <p className="text-muted-foreground mt-1">Manage global subjects to be assigned to classes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={downloadFlowGuide}
                        className="border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                        <Download className="w-4 h-4" /> Flow Guide
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Subject
                    </button>
                </div>
            </div>

            {/* Card + table — mirrors Students page structure exactly */}
            <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
                {/* Toolbar row */}
                <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or code..."
                            className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground font-medium">
                        {filtered.length} {filtered.length !== subjects.length ? `of ${subjects.length}` : "Total"} Records
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                            <tr>
                                <th className="px-6 py-3 font-medium">Code</th>
                                <th className="px-6 py-3 font-medium">Subject Name</th>
                                <th className="px-6 py-3 font-medium">Type</th>
                                <th className="px-6 py-3 font-medium">Description</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                        Loading subjects...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-red-400 bg-red-500/5">{error}</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        {search
                                            ? "No subjects match your search."
                                            : "No subjects found. Add a subject to get started."}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(s => (
                                    <tr key={s.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{s.code}</td>
                                        <td className="px-6 py-4 font-medium">{s.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{s.subjectType || "CORE"}</td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-xs">{s.description || "—"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(s.id, s.name)}
                                                className="inline-flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Subject"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Subject Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">Add Subject</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Name *</label>
                                <input
                                    required
                                    type="text"
                                    value={newSubject.name}
                                    onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Mathematics"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 flex items-center justify-between">
                                    Code
                                    <span className="text-[10px] text-muted-foreground font-normal">Auto-generated if empty</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSubject.code}
                                        onChange={e => setNewSubject({ ...newSubject, code: e.target.value })}
                                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g. MATH101"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg flex items-center justify-center transition-colors border border-border shrink-0"
                                        title="Generate Code"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea
                                    value={newSubject.description}
                                    onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    rows={2}
                                    placeholder="Optional description..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject Type *</label>
                                <select
                                    required
                                    value={newSubject.subjectType}
                                    onChange={e => setNewSubject({ ...newSubject, subjectType: e.target.value })}
                                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="CORE">Core</option>
                                    <option value="ELECTIVE">Elective</option>
                                    <option value="OPTIONAL">Optional</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {isSubmitting ? "Creating..." : "Create Subject"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
