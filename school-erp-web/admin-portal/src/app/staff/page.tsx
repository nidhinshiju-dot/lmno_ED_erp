"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { StaffService, SubjectService } from "@/lib/api";
import { Plus, Building2, Briefcase, BookOpen, Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

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
    teacherType?: string;
    maxPeriods?: number;
    workloadRatio?: number;
}

export default function StaffDirectoryPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "", department: "Administration", designation: "",
        email: "", phone: "",
        subjects: [] as string[],
        teacherType: "FULL_TIME", maxPeriods: 30, workloadRatio: 1.0,
        gender: "", dob: "", joinDate: "", highestQualification: "", address: ""
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                subjects: formData.department === "Teaching" ? formData.subjects : [],
                maxPeriods: formData.teacherType === "FULL_TIME" ? 30 : 15,
                workloadRatio: formData.teacherType === "FULL_TIME" ? 1.0 : 0.5,
            };

            await StaffService.create(payload);

            setIsModalOpen(false);
            setFormData({ 
                name: "", department: "Administration", designation: "", email: "", phone: "", 
                subjects: [], teacherType: "FULL_TIME", maxPeriods: 30, workloadRatio: 1.0,
                gender: "", dob: "", joinDate: "", highestQualification: "", address: ""
            });
            loadStaff();
        } catch (error: any) {
            console.error("Failed to save staff member:", error);
            const msg = error?.message || "Error saving staff record. Check that the phone number is unique.";
            alert(msg);
        }
    };

    const openAddModal = () => {
        setFormData({ 
            name: "", department: "Administration", designation: "", email: "", phone: "", 
            subjects: [], teacherType: "FULL_TIME", maxPeriods: 30, workloadRatio: 1.0,
            gender: "", dob: "", joinDate: "", highestQualification: "", address: ""
        });
        setIsModalOpen(true);
    };

    const toggleSubject = (subjectId: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subjectId)
                ? prev.subjects.filter(id => id !== subjectId)
                : [...prev.subjects, subjectId]
        }));
    };

    const handleDeleteStaff = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }
        try {
            await StaffService.delete(id);
            loadStaff();
        } catch (error) {
            console.error("Failed to delete staff member:", error);
            alert("Error deleting staff record.");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">

                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Manage school employees, teachers, and administration.</p>
                        <button
                            onClick={openAddModal}
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
                                            <tr 
                                                key={member.id} 
                                                onClick={() => router.push(`/staff/${member.id}`)}
                                                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div className="font-medium group-hover:text-indigo-600 transition-colors">{member.name}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-muted-foreground">
                                                    {member.userId}
                                                    {member.department === "Teaching" && member.teacherType && (
                                                        <div className="mt-1 font-sans text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-max">
                                                            {member.teacherType.replace("_", " ")} ({member.maxPeriods} max pds)
                                                        </div>
                                                    )}
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
                                                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-2 text-indigo-600 font-medium">
                                                                <BookOpen className="w-4 h-4" />
                                                                {member.subjects.length} subject{member.subjects.length !== 1 ? 's' : ''}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {member.subjects.map(subId => (
                                                                    <span key={subId} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded border border-indigo-100 uppercase tracking-wider font-semibold">
                                                                        {subjects.find(s => s.id === subId)?.name || "Unknown"}
                                                                    </span>
                                                                ))}
                                                            </div>
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
                            <form id="add-staff-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input required type="text" className="w-full p-2 border border-border rounded-lg bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Jane Doe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <input type="email" className="w-full p-2 border border-border rounded-lg bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="teacher@school.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone <span className="text-red-500">*</span></label>
                                        <input required type="tel" className="w-full p-2 border border-border rounded-lg bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9000000000" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Gender</label>
                                        <select className="w-full p-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none" value={formData.gender || ""} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date of Birth</label>
                                        <input type="date" className="w-full p-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none" value={formData.dob || ""} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date of Joining</label>
                                        <input type="date" className="w-full p-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none" value={formData.joinDate || ""} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Highest Qualification</label>
                                        <input type="text" className="w-full p-2 border border-border rounded-lg bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none" value={formData.highestQualification || ""} onChange={e => setFormData({ ...formData, highestQualification: e.target.value })} placeholder="e.g. Master's in Ed." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <textarea className="w-full p-2 border border-border rounded-lg bg-background placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none h-16" value={formData.address || ""} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Enter full address" />
                                </div>

                                {formData.department === "Teaching" && (<>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Teacher Type</label>
                                            <select className="w-full p-2 border border-border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:outline-none" value={formData.teacherType} onChange={e => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, teacherType: val, maxPeriods: val === "FULL_TIME" ? 30 : 15, workloadRatio: val === "FULL_TIME" ? 1.0 : 0.5 });
                                            }}>
                                                <option value="FULL_TIME">Full Time</option>
                                                <option value="PART_TIME">Part Time</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Max Periods</label>
                                            <input required type="number" min="1" max="50" className="w-full p-2 border border-border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:outline-none" value={formData.maxPeriods} onChange={e => setFormData({ ...formData, maxPeriods: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    
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
                                </>)}
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
