"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { SubjectService, ClassService, StaffService } from "@/lib/api";
import { Plus, BookOpen, Search, Trash2, RefreshCw, Download } from "lucide-react";
import { generateFlowPDF } from "@/lib/pdfGenerator";

interface SubjectItem { id: string; name: string; code: string; description: string; subjectType: string; status: string; }

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: "", code: "", description: "", subjectType: "CORE", status: "ACTIVE" });

    useEffect(() => {
        const load = async () => {
            try {
                const subData = await SubjectService.getAll();
                setSubjects(subData);
            } catch { console.error("Failed to load"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const filtered = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );



    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await SubjectService.create(newSubject);
            setSubjects([...subjects, created]);
            setIsModalOpen(false);
            setNewSubject({ name: "", code: "", description: "", subjectType: "CORE", status: "ACTIVE" });
        } catch { alert("Failed to create subject"); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This will remove it globally.`)) return;
        try {
            await SubjectService.delete(id);
            setSubjects(prev => prev.filter(s => s.id !== id));
        } catch { alert("Failed to delete subject. It might be assigned to a class."); }
    };

    const generateCode = () => {
        if (!newSubject.name || newSubject.name.trim() === "") {
            alert("Please enter a Subject Name first to generate its code.");
            return;
        }
        let prefix = newSubject.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
        if (prefix.length < 4 && prefix.length > 0) {
            prefix = prefix.padEnd(4, 'X'); // Pad with X if shorter than 4 chars
        } else if (prefix.length === 0) {
            prefix = "SUBJ";
        }
        const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit number e.g. 100-999
        setNewSubject({ ...newSubject, code: `${prefix}${randomNum}` });
    };

    const downloadFlowGuide = () => {
        generateFlowPDF({
            featureName: "Global Subjects",
            description: "Subjects in this ERP are global entities. This means you create 'Mathematics' once, and then assign it to as many classes as you need (e.g., Class 1A, Class 2B) rather than creating duplicates.",
            steps: [
                {
                    title: "Create the Global Subject",
                    description: "Click 'Add Subject' to define the subject name, type (Core, Elective), and auto-generate a unique Code.",
                    example: "Creating 'Science Practical' as a CORE subject."
                },
                {
                    title: "Navigate to a Class",
                    description: "Go to the 'Classes' tab on the main menu, and click the 'Manage Subjects' (Book) icon for a specific class.",
                    example: "Opening the management page for 'Class 10A'."
                },
                {
                    title: "Assign Subject to Class",
                    description: "Select the global subject from the dropdown, choose an available Teacher, and specify the number of Weekly Periods required.",
                    example: "Assigning 'Science Practical' to 'Class 10A', taught by 'Mr. Smith', for 2 periods per week."
                }
            ],
            proTip: "If you delete a global subject from this master list, it will automatically un-assign it from all classes currently taking it."
        });
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Global Subjects</h2>
                            <p className="text-muted-foreground mt-1">Manage global subjects to be assigned to classes.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                            <Plus className="w-4 h-4" /> Add Subject
                        </button>
                    </div>

                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground">Code</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Subject Name</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Type</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Description</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Status</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />No subjects found.</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-mono text-xs font-bold text-primary">{s.code}</td>
                                        <td className="p-4 font-medium">{s.name}</td>
                                        <td className="p-4 text-muted-foreground">{s.subjectType || "CORE"}</td>
                                        <td className="p-4 text-muted-foreground truncate max-w-xs">{s.description || "—"}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(s.id, s.name)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Subject"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <button onClick={downloadFlowGuide} className="flex items-center gap-2 text-sm text-primary hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 transition-colors">
                            <Download className="w-4 h-4" /> Download UI Flow Guide (PDF)
                        </button>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold mb-4">Add Subject</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Name *</label>
                                    <input required type="text" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mathematics" />
                                </div>
                                <div><label className="text-sm font-medium mb-1 flex items-center justify-between">Code <span className="text-[10px] text-muted-foreground font-normal ml-1">(Auto-generated if empty)</span></label>
                                    <div className="flex gap-2">
                                        <input type="text" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. MATH010" />
                                        <button type="button" onClick={generateCode} className="p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg flex items-center justify-center transition-colors border border-border shrink-0" title="Generate Code">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div><label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea value={newSubject.description} onChange={e => setNewSubject({ ...newSubject, description: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={2} />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Subject Type *</label>
                                    <select required value={newSubject.subjectType} onChange={e => setNewSubject({ ...newSubject, subjectType: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="CORE">Core</option>
                                        <option value="ELECTIVE">Elective</option>
                                        <option value="OPTIONAL">Optional</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
