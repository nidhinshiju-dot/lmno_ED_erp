"use client";

import { useEffect, useState } from "react";
import { StudentService, ClassService, StudentManagementService, fetchWithAuth, FileService } from "@/lib/api";
import { Plus, Search, Loader2, Wand2, ArrowUpCircle, Filter, Upload, FileDown, Download } from "lucide-react";
import Link from "next/link";
import { BulkImportModal } from "@/components/BulkImportModal";
import * as XLSX from "xlsx";

interface Student {
    id: string;
    admissionNumber: string;
    name: string;
    dob: string | null;
    parentContact: string | null;
    classId: string | null;
}

export default function StudentsPage() {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isPromoteOpen, setIsPromoteOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [promoteForm, setPromoteForm] = useState({ fromClassId: "", toClassId: "" });
    const [promoting, setPromoting] = useState(false);
    const [promoteResult, setPromoteResult] = useState<string | null>(null);

    const [newStudent, setNewStudent] = useState({
        admissionNumber: "",
        name: "",
        dob: "",
        countryCode: "+91",
        parentContact: "",
        classId: "",
        guardianName: "",
        guardianRelation: ""
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [studData, clsData] = await Promise.all([
                StudentService.getAll(),
                fetchWithAuth("/classes")
            ]);
            setAllStudents(studData);
            const sortedClasses = [...clsData].sort((a, b) => {
                if (a.gradeLevel !== b.gradeLevel) return (a.gradeLevel || 0) - (b.gradeLevel || 0);
                return a.name.localeCompare(b.name);
            });
            setClasses(sortedClasses);
        } catch (err) {
            setError("Could not connect to the Backend API. Are the gateway and core-service running?");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Load students by class when filter changes
    useEffect(() => {
        if (!selectedClass) {
            StudentService.getAll().then(setAllStudents).catch(console.error);
            return;
        }
        StudentManagementService.getByClass(selectedClass).then(setAllStudents).catch(console.error);
    }, [selectedClass]);

    // Client-side search filter
    const displayedStudents = allStudents.filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.admissionNumber.toLowerCase().includes(q) || (s.parentContact && s.parentContact.includes(q));
    });

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Phone validation
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(newStudent.parentContact)) {
            alert("Phone number must contain only numbers. Symbols and spaces are not allowed.");
            return;
        }

        setIsSubmitting(true);
        try {
            let parentId = null;
            let guardianName = newStudent.guardianName;
            let guardianRelation = newStudent.guardianRelation;

            // 2. Duplicate Parent Check
            const fullContact = `${newStudent.parentContact}`;
            try {
                const parentMatch = await StudentService.checkParent(fullContact);
                if (parentMatch && parentMatch.parentId) {
                    const existingName = parentMatch.guardianName ? ` (${parentMatch.guardianName})` : "";
                    const confirmLink = window.confirm(`Parent phone number already exists${existingName}. Link this new student to the same parent account?`);
                    if (!confirmLink) {
                        setIsSubmitting(false);
                        return; // User cancelled
                    }
                    parentId = parentMatch.parentId;
                    guardianName = parentMatch.guardianName || guardianName;
                    guardianRelation = parentMatch.guardianRelation || guardianRelation;
                }
            } catch (err: any) {
                // 404 Not Found is expected if parent does not exist, safe to proceed
            }

            // 3. Optional Photo Upload
            let photoUrl = null;
            if (photoFile) {
                try {
                    const uploadRes = await FileService.upload(photoFile, "student_photo", "student_profiles");
                    photoUrl = uploadRes.filePath;
                } catch (uploadErr) {
                    alert("Failed to upload photo. Proceeding without photo.");
                }
            }

            const payload = {
                ...newStudent,
                guardianName,
                guardianRelation,
                parentId,
                photoUrl,
                userId: `u-${Math.random().toString(36).substring(7)}`
            };

            const res = await fetchWithAuth("/students", { method: "POST", body: JSON.stringify(payload) });
            setAllStudents([...allStudents, res]);
            setIsModalOpen(false);
            setNewStudent({ admissionNumber: "", name: "", dob: "", countryCode: "+91", parentContact: "", classId: "", guardianName: "", guardianRelation: "" });
            setPhotoFile(null);
            
            // Reload list to apply server-side sorting if needed
            if (selectedClass) {
                const updatedList = await StudentManagementService.getByClass(selectedClass);
                setAllStudents(updatedList);
            } else {
                const updatedList = await StudentService.getAll();
                setAllStudents(updatedList);
            }

        } catch (err) {
            console.error("Student creation failed", err);
            alert("Failed to create student. Please verify all inputs and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateAdmissionNumber = () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.floor(1000 + Math.random() * 9000);
        setNewStudent(prev => ({ ...prev, admissionNumber: `ADM-${dateStr}-${rand}` }));
    };

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (promoteForm.fromClassId === promoteForm.toClassId) {
            alert("From and To classes must be different.");
            return;
        }
        setPromoting(true);
        setPromoteResult(null);
        try {
            const res = await StudentManagementService.promote(promoteForm.fromClassId, promoteForm.toClassId);
            const count = res?.promotedCount ?? res?.count ?? "some";
            setPromoteResult(`✅ Successfully promoted ${count} students.`);
            // Reload students
            const updated = await StudentService.getAll();
            setAllStudents(updated);
        } catch (e: any) {
            setPromoteResult(`❌ Promotion failed: ${e?.message || "Check backend."}`);
        } finally { setPromoting(false); }
    };

    const handleExportExcel = () => {
        if (displayedStudents.length === 0) {
            alert("No data available to export.");
            return;
        }

        const exportData = displayedStudents.map(s => {
            const studentClass = classes.find(c => c.id === s.classId);
            const className = studentClass ? `${studentClass.name}${studentClass.branch ? ` (${studentClass.branch})` : ''}` : "N/A";
            
            return {
                "Admission Number": s.admissionNumber,
                "Student Name": s.name,
                "Class": className,
                "Date of Birth": s.dob || "N/A",
                "Parent Contact": s.parentContact || "N/A"
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        
        const fileName = selectedClass 
            ? `Students_Class_${classes.find(c => c.id === selectedClass)?.name || "Filtered"}_${new Date().toISOString().split("T")[0]}.xlsx`
            : `Students_All_${new Date().toISOString().split("T")[0]}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                    <p className="text-muted-foreground mt-1">Manage enrollments, profiles, and academic records.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setIsPromoteOpen(true); setPromoteResult(null); }}
                        className="border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                        <ArrowUpCircle className="w-4 h-4" /> Promote Students
                    </button>
                    <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                        <Upload className="w-4 h-4" /> Bulk Import
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Student
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
                <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name, ID, or phone..."
                            className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    {/* Class filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}{c.branch ? ` (${c.branch})` : ""}</option>
                            ))}
                        </select>
                        {selectedClass && (
                            <button onClick={() => setSelectedClass("")} className="text-xs text-blue-600 hover:underline px-2">Reset Filter</button>
                        )}
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground font-medium">
                        {displayedStudents.length} {displayedStudents.length !== allStudents.length ? `of ${allStudents.length}` : "Total"} Records
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
                                    <td colSpan={5} className="px-6 py-8 text-center text-red-400 bg-red-500/5">{error}</td>
                                </tr>
                            ) : displayedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        {searchQuery || selectedClass ? "No students match your filters." : "No students found. Add a new student to get started."}
                                    </td>
                                </tr>
                            ) : (
                                displayedStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{student.admissionNumber}</td>
                                        <td className="px-6 py-4 font-medium">{student.name}</td>
                                        <td className="px-6 py-4">{student.dob || "N/A"}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{student.parentContact || "N/A"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/students/${student.id}`} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors">
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-2xl border border-border rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Register New Student</h3>
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
                                        <button type="button" onClick={generateAdmissionNumber} className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors">
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
                                    <select required value={newStudent.classId} onChange={e => setNewStudent({ ...newStudent, classId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
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
                                    <div className="flex gap-2">
                                        <select 
                                            value={newStudent.countryCode} 
                                            onChange={e => setNewStudent({ ...newStudent, countryCode: e.target.value })} 
                                            className="w-1/3 bg-muted border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                        >
                                            <option value="+91">+91 (IN)</option>
                                            <option value="+1">+1 (US/CA)</option>
                                            <option value="+61">+61 (AU)</option>
                                            <option value="+971">+971 (UAE)</option>
                                        </select>
                                        <input required type="tel" value={newStudent.parentContact} onChange={e => setNewStudent({ ...newStudent, parentContact: e.target.value })} className="w-2/3 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="9876543210" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Student Photo</label>
                                    <div className="relative">
                                        <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="w-full bg-muted border border-dashed border-border flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/80 transition-colors">
                                            <Upload className="w-4 h-4 text-primary" />
                                            <span className="truncate">{photoFile ? photoFile.name : "Choose an image..."}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-border mt-6 pt-4">
                                <h4 className="text-sm font-semibold mb-3">Parent / Guardian Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Guardian Name</label>
                                        <input type="text" value={newStudent.guardianName} onChange={e => setNewStudent({ ...newStudent, guardianName: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mr. John Doe" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Relationship</label>
                                        <select value={newStudent.guardianRelation} onChange={e => setNewStudent({ ...newStudent, guardianRelation: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                                            <option value="">Select</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Guardian">Guardian</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {isSubmitting ? "Registering..." : "Register Student"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Promote Students Modal */}
            {isPromoteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold mb-1">Promote Students</h3>
                        <p className="text-sm text-muted-foreground mb-4">Move all students from one class to another (end-of-year promotion).</p>
                        <form onSubmit={handlePromote} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">From Class</label>
                                <select required value={promoteForm.fromClassId} onChange={e => setPromoteForm({ ...promoteForm, fromClassId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select current class...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.branch ? ` (${c.branch})` : ""}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">To Class</label>
                                <select required value={promoteForm.toClassId} onChange={e => setPromoteForm({ ...promoteForm, toClassId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select target class...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.branch ? ` (${c.branch})` : ""}</option>)}
                                </select>
                            </div>
                            {promoteResult && (
                                <div className={`p-3 rounded-lg text-sm font-medium ${promoteResult.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    {promoteResult}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                <button type="button" onClick={() => setIsPromoteOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Close</button>
                                <button type="submit" disabled={promoting} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 rounded-lg flex items-center gap-2">
                                    {promoting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {promoting ? "Promoting..." : "Promote"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Bulk Import Modal */}
            {isBulkImportOpen && (
                <BulkImportModal
                    classes={classes}
                    onClose={() => setIsBulkImportOpen(false)}
                    onImportSuccess={() => {
                        setIsBulkImportOpen(false);
                        fetchInitialData();
                    }}
                />
            )}
        </div>
    );
}
