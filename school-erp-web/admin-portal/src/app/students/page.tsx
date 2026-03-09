"use client";

import { useEffect, useState } from "react";
import { StudentService, fetchWithAuth } from "@/lib/api";
import { Plus, Search, MoreVertical, Loader2, Wand2 } from "lucide-react";

interface Student {
    id: string;
    admissionNumber: string;
    name: string;
    dob: string | null;
    parentContact: string | null;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newStudent, setNewStudent] = useState({
        admissionNumber: "",
        name: "",
        dob: "",
        parentContact: "",
        classId: "",
        guardianName: "",
        guardianRelation: ""
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [studData, clsData] = await Promise.all([
                    StudentService.getAll(),
                    fetchWithAuth("/classes")
                ]);
                setStudents(studData);
                
                // Sort classes
                const sortedClasses = [...clsData].sort((a, b) => {
                    if (a.gradeLevel !== b.gradeLevel) return (a.gradeLevel || 0) - (b.gradeLevel || 0);
                    return a.name.localeCompare(b.name);
                });
                setClasses(sortedClasses);
            } catch (err) {
                console.error("Failed to fetch students. Ensure the backend is running.", err);
                setError("Could not connect to the Backend API. Are the gateway and core-service running?");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // In a real app we'd map this properly to DTOs
            const payload = {
                admissionNumber: newStudent.admissionNumber,
                name: newStudent.name,
                dob: newStudent.dob || null,
                parentContact: newStudent.parentContact || null,
                classId: newStudent.classId,
                userId: `u-${Math.random().toString(36).substring(7)}` // Mocked UserId for now
            };

            const res = await fetchWithAuth("/students", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            setStudents([...students, res]);
            setIsModalOpen(false);
            setNewStudent({ admissionNumber: "", name: "", dob: "", parentContact: "", classId: "", guardianName: "", guardianRelation: "" });
        } catch {
            alert("Failed to create student. Backend may not be reachable.");
        }
    };

    const generateAdmissionNumber = () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.floor(1000 + Math.random() * 9000);
        const admNo = `ADM-${dateStr}-${rand}`;
        setNewStudent(prev => ({ ...prev, admissionNumber: admNo }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                    <p className="text-muted-foreground mt-1">Manage enrollments, profiles, and academic records.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Student
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                        {students.length} Total Records
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
                            <tr>
                                <th className="px-6 py-3 font-medium">Admission ID</th>
                                <th className="px-6 py-3 font-medium">Full Name</th>
                                <th className="px-6 py-3 font-medium">Date of Birth</th>
                                <th className="px-6 py-3 font-medium">Parent Contact</th>
                                <th className="px-6 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                        Loading student directory...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-red-400 bg-red-500/5">
                                        {error}
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No students found. Add a new student to get started.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{student.admissionNumber}</td>
                                        <td className="px-6 py-4 font-medium">{student.name}</td>
                                        <td className="px-6 py-4">{student.dob || "N/A"}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{student.parentContact || "N/A"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                                                <MoreVertical className="w-4 h-4 inline-block" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-lg border border-border rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Register New Student</h3>
                        <p className="text-sm text-muted-foreground mb-4">Only school administrators can register students.</p>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Full Name *</label>
                                    <input required type="text" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Jane Doe" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Admission Number *</label>
                                    <div className="relative">
                                        <input required type="text" value={newStudent.admissionNumber} onChange={e => setNewStudent({ ...newStudent, admissionNumber: e.target.value })} className="w-full bg-muted border border-border rounded-lg pl-3 pr-24 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ADM-20260309-1234" />
                                        <button
                                            type="button"
                                            onClick={generateAdmissionNumber}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                                        >
                                            <Wand2 className="w-3 h-3" /> Generate
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Date of Birth *</label>
                                    <input required type="date" value={newStudent.dob} onChange={e => setNewStudent({ ...newStudent, dob: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Class & Division *</label>
                                    <select required value={newStudent.classId} onChange={e => setNewStudent({ ...newStudent, classId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select Class & Division</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}{c.branch ? ` (${c.branch})` : ''}{c.roomNumber ? ` — Div ${c.roomNumber}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Parent Contact *</label>
                                    <input required type="text" value={newStudent.parentContact} onChange={e => setNewStudent({ ...newStudent, parentContact: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+91 98765 43210" />
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mt-2">
                                <h4 className="text-sm font-semibold mb-3">Parent / Guardian Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Guardian Name</label>
                                        <input type="text" value={newStudent.guardianName} onChange={e => setNewStudent({ ...newStudent, guardianName: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mr. John Doe" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Relationship</label>
                                        <select value={newStudent.guardianRelation} onChange={e => setNewStudent({ ...newStudent, guardianRelation: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                            <option value="">Select</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Guardian">Guardian</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg transition-colors">
                                    Register Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
