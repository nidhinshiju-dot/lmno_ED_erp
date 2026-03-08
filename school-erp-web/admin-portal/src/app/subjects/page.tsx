"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { SubjectService, ClassService, StaffService } from "@/lib/api";
import { Plus, BookOpen, Search } from "lucide-react";

interface SubjectItem { id: string; name: string; code: string; description: string; classId: string; teacherId: string; status: string; }
interface ClassItem { id: string; name: string; }
interface StaffMember { id: string; name: string; }

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: "", code: "", description: "", classId: "", teacherId: "", status: "ACTIVE" });

    useEffect(() => {
        const load = async () => {
            try {
                const [subData, clsData, staffData] = await Promise.all([SubjectService.getAll(), ClassService.getAll(), StaffService.getAll()]);
                setSubjects(subData);
                setClasses(clsData);
                setStaff(staffData);
            } catch { console.error("Failed to load"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const filtered = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "—";
    const getTeacherName = (id: string) => staff.find(s => s.id === id)?.name || "—";

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await SubjectService.create(newSubject);
            setSubjects([...subjects, created]);
            setIsModalOpen(false);
            setNewSubject({ name: "", code: "", description: "", classId: "", teacherId: "", status: "ACTIVE" });
        } catch { alert("Failed to create subject"); }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Subject Management" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
                            <p className="text-muted-foreground mt-1">Manage subjects, assign to classes and teachers.</p>
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
                                    <th className="p-4 font-semibold text-muted-foreground">Class</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Teacher</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Status</th>
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
                                        <td className="p-4 text-muted-foreground">{getClassName(s.classId)}</td>
                                        <td className="p-4 text-muted-foreground">{getTeacherName(s.teacherId)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold mb-4">Add Subject</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Name *</label>
                                    <input required type="text" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mathematics" />
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Code *</label>
                                    <input required type="text" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="MATH101" />
                                </div>
                            </div>
                            <div><label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Class</label>
                                    <select value={newSubject.classId} onChange={e => setNewSubject({...newSubject, classId: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Teacher</label>
                                    <select value={newSubject.teacherId} onChange={e => setNewSubject({...newSubject, teacherId: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
