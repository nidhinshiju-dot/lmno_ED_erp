"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { StaffService, SubjectService } from "@/lib/api";
import { Plus, Building2, Briefcase, BookOpen } from "lucide-react";

interface Subject {
    id: string;
    name: string;
}

interface StaffMember {
    id: string;
    name: string;
    userId: string;
    department: string;
    designation: string;
    subjects?: string[];
}

export default function StaffDirectoryPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "", department: "Administration", designation: "", subjects: [] as string[]
    });

    useEffect(() => {
        loadStaff();
        SubjectService.getAll().then(setSubjects).catch(console.error);
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const data = await StaffService.getAll();
            setStaff(data);
        } catch (error) {
            console.error("Failed to load staff directory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                userId: `u-${Math.random().toString(36).substring(7)}`, // Mocking Identity User ID matching the student approach
                subjects: formData.department === "Teaching" ? formData.subjects : []
            };
            await StaffService.create(payload);
            setIsModalOpen(false);
            setFormData({ name: "", department: "Administration", designation: "", subjects: [] });
            loadStaff();
        } catch (error) {
            console.error("Failed to create staff member:", error);
            alert("Error creating staff record");
        }
    };

    const toggleSubject = (subjectId: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subjectId)
                ? prev.subjects.filter(id => id !== subjectId)
                : [...prev.subjects, subjectId]
        }));
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">

                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Manage school employees, teachers, and administration.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Staff
                        </button>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Name</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">User ID</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Department</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Designation</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Subjects</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                Loading directory...
                                            </td>
                                        </tr>
                                    ) : staff.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No staff members found.
                                            </td>
                                        </tr>
                                    ) : (
                                        staff.map((member) => (
                                            <tr key={member.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div className="font-medium">{member.name}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-muted-foreground">
                                                    {member.userId}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                                        {member.department}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full w-max">
                                                        <Briefcase className="w-4 h-4" />
                                                        {member.designation}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {member.department === "Teaching" && member.subjects && member.subjects.length > 0 ? (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <BookOpen className="w-4 h-4 text-indigo-500" />
                                                            {member.subjects.length} subject{member.subjects.length !== 1 ? 's' : ''}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-card rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card z-10">
                            <h2 className="text-lg font-bold">Add Staff Member</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                &times;
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form id="add-staff-form" onSubmit={handleAddStaff} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input required type="text" className="w-full p-2 border border-border rounded-lg bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Jane Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Department</label>
                                    <select className="w-full p-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                        <option value="Administration">Administration</option>
                                        <option value="Teaching">Teaching</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Designation</label>
                                    <input required type="text" className="w-full p-2 border border-border rounded-lg bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g. Senior Teacher" />
                                </div>

                                {formData.department === "Teaching" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Qualified Subjects</label>
                                        <div className="bg-muted/30 border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                                            {subjects.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No subjects found. Create subjects first.</p>
                                            ) : (
                                                subjects.map(subject => (
                                                    <label key={subject.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-border text-primary focus:ring-primary"
                                                            checked={formData.subjects.includes(subject.id)}
                                                            onChange={() => toggleSubject(subject.id)}
                                                        />
                                                        {subject.name}
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-border bg-card flex justify-end gap-3 z-10">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="add-staff-form" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm">
                                Add Staff
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
