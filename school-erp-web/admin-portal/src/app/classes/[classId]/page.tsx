"use client";

import { useState, useEffect, use } from "react";
import { ClassService, SubjectService, StaffService, ClassSubjectService, StudentManagementService, ClassSubjectTeacherService } from "@/lib/api";
import { Plus, BookOpen, Trash2, ArrowLeft, Users, User, Search, Star, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ClassSubjectItem { id: string; subjectName: string; subjectCode: string; subjectType: string; teacherName: string; periodsPerWeek: number; }
interface GlobalSubject { id: string; name: string; code: string; subjectType: string; }
interface StaffMember { id: string; name: string; department?: string; role?: string; email?: string; }
interface ClassDetails { id: string; name: string; gradeLevel: number; branch: string; capacity?: number; roomNumber?: string; academicYear?: string; }
interface Student { id: string; name: string; admissionNumber: string; dob: string | null; status: string; }
interface Assignment { id: string; subjectId: string; subjectName: string; teacherId: string; teacherName: string; periodsPerWeek: number; }

type TabType = "students" | "teacher" | "subjects";

export default function ClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [assignedSubjects, setAssignedSubjects] = useState<ClassSubjectItem[]>([]);
    const [globalSubjects, setGlobalSubjects] = useState<GlobalSubject[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("students");
    const [studentSearch, setStudentSearch] = useState("");
    const [studentFilter, setStudentFilter] = useState<"all" | "active" | "inactive">("all");
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ classId, subjectId: "", teacherId: "", periodsPerWeek: 5 });

    useEffect(() => {
        const load = async () => {
            try {
                const [classesData, subjectsData, staffData] = await Promise.all([
                    ClassService.getAll(),
                    SubjectService.getAll(),
                    StaffService.getAll(),
                ]);
                const cls = classesData.find((c: any) => c.id === classId);
                setClassDetails(cls || null);
                setGlobalSubjects(subjectsData);
                setStaff(staffData);

                const [studData, classSubjectsData, cstData] = await Promise.all([
                    StudentManagementService.getByClass(classId),
                    ClassSubjectService.getByClass(classId),
                    ClassSubjectTeacherService.getByClass(classId),
                ]);
                setStudents(studData);
                setAssignedSubjects(classSubjectsData);
                setAssignments(cstData);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [classId]);

    const handleAssignSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ClassSubjectService.assignSubject(newAssignment);
            const updated = await ClassSubjectService.getByClass(classId);
            setAssignedSubjects(updated);
            setIsSubjectModalOpen(false);
            setNewAssignment({ classId, subjectId: "", teacherId: "", periodsPerWeek: 5 });
        } catch { alert("Failed to assign subject."); }
    };

    const handleRemoveSubject = async (id: string) => {
        if (!confirm("Remove this subject assignment?")) return;
        try {
            await ClassSubjectService.unassignSubject(id);
            setAssignedSubjects(prev => prev.filter(s => s.id !== id));
        } catch { alert("Failed to remove subject."); }
    };

    // Students display with filter + search
    const displayedStudents = students.filter(s => {
        const matchSearch = !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase());
        const matchStatus = studentFilter === "all" || (studentFilter === "active" ? s.status === "ACTIVE" : s.status !== "ACTIVE");
        return matchSearch && matchStatus;
    });

    // Class teachers (CST assignments — one teacher per subject)
    const uniqueTeachers = Array.from(
        new Map(assignments.filter(a => a.teacherId).map(a => [a.teacherId, a])).values()
    );

    const classTeacher = uniqueTeachers[0]; // primary/first teacher

    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading class details...</div>;
    if (!classDetails) return <div className="flex-1 p-8 text-center text-red-500">Class not found.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <Link href="/classes" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight">{classDetails.name}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {classDetails.gradeLevel && (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-semibold">Grade {classDetails.gradeLevel}</span>
                        )}
                        {classDetails.branch && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">{classDetails.branch}</span>
                        )}
                        {classDetails.roomNumber && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-semibold">Div {classDetails.roomNumber}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{students.length} students enrolled</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
                {([
                    ["students", <Users key="s" className="w-4 h-4" />, "Students"],
                    ["teacher", <User key="t" className="w-4 h-4" />, "Teachers"],
                    ["subjects", <BookOpen key="b" className="w-4 h-4" />, "Subjects"],
                ] as [TabType, React.ReactNode, string][]).map(([tab, icon, label]) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {icon} {label}
                        {tab === "students" && <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 font-bold">{students.length}</span>}
                    </button>
                ))}
            </div>

            {/* ── Students Tab ── */}
            {activeTab === "students" && (
                <div className="bg-card border border-border rounded-xl shadow-sm">
                    <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
                        <div className="relative w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                placeholder="Search students..."
                                className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex gap-1">
                            {(["all", "active", "inactive"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setStudentFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${studentFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">{displayedStudents.length} of {students.length}</span>
                    </div>
                    <div className="divide-y divide-border">
                        {displayedStudents.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">{studentSearch || studentFilter !== "all" ? "No students match your filters." : "No students enrolled in this class yet."}</p>
                            </div>
                        ) : displayedStudents.map((student, idx) => (
                            <div key={student.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{student.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{student.admissionNumber}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${student.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                    {student.status}
                                </span>
                                <Link href={`/students/${student.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Teacher Tab ── */}
            {activeTab === "teacher" && (
                <div className="space-y-4">
                    {uniqueTeachers.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                            <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No teachers assigned yet.</p>
                            <p className="text-sm mt-1">Add subject-teacher assignments in the Subjects tab or via Timetable → Class Assignments.</p>
                        </div>
                    ) : uniqueTeachers.map((a, idx) => {
                        const staffMember = staff.find(s => s.id === a.teacherId);
                        return (
                            <div key={a.teacherId} className="bg-card border border-border rounded-xl p-5 flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${idx === 0 ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-slate-400 to-slate-500"}`}>
                                    {a.teacherName?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-lg">{a.teacherName}</p>
                                        {idx === 0 && (
                                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                <Star className="w-3 h-3" /> Class Teacher
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Teaches: {assignments.filter(x => x.teacherId === a.teacherId).map(x => x.subjectName).join(", ")}
                                    </p>
                                    {staffMember?.department && <p className="text-xs text-muted-foreground mt-0.5">Dept: {staffMember.department}</p>}
                                </div>
                                <GraduationCap className="w-6 h-6 text-muted-foreground opacity-40" />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Subjects Tab ── */}
            {activeTab === "subjects" && (
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{assignedSubjects.length} Subject{assignedSubjects.length !== 1 ? "s" : ""} Assigned</p>
                        <button onClick={() => setIsSubjectModalOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            <Plus className="w-4 h-4" /> Assign Subject
                        </button>
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="bg-muted/50 text-left">
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Subject</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Teacher</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Periods/Wk</th>
                            <th className="px-4 py-3"></th>
                        </tr></thead>
                        <tbody className="divide-y divide-border">
                            {assignedSubjects.map(s => (
                                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium">{s.subjectName}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{s.subjectCode}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">{s.subjectType || "CORE"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{s.teacherName || "—"}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-7 h-7 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">{s.periodsPerWeek || "—"}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleRemoveSubject(s.id)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                            {assignedSubjects.length === 0 && (
                                <tr><td colSpan={5} className="text-center text-muted-foreground py-10">
                                    No subjects assigned yet. Click &quot;Assign Subject&quot; to add one.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assign Subject Modal */}
            {isSubjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Assign Subject to {classDetails.name}</h3>
                        <form onSubmit={handleAssignSubject} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject</label>
                                <select required value={newAssignment.subjectId} onChange={e => setNewAssignment({ ...newAssignment, subjectId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select subject...</option>
                                    {globalSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Teacher <span className="text-muted-foreground font-normal">(optional)</span></label>
                                <select value={newAssignment.teacherId} onChange={e => setNewAssignment({ ...newAssignment, teacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select teacher...</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Periods per Week</label>
                                <input type="number" min={1} max={20} required value={newAssignment.periodsPerWeek} onChange={e => setNewAssignment({ ...newAssignment, periodsPerWeek: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
