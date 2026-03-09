"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { StudentService } from "@/lib/api";
import { ArrowLeft, User, Phone, Calendar, MapPin, Loader2, Save, Image as ImageIcon, BookOpen } from "lucide-react";
import Link from "next/link";

interface StudentProps {
    id: string;
    admissionNumber: string;
    name: string;
    dob: string | null;
    parentContact: string | null;
    address: string | null;
    photoUrl: string | null;
    status: string;
    classId: string | null;
}



export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [student, setStudent] = useState<StudentProps | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form editing state
    const [formData, setFormData] = useState({
        photoUrl: "",
        parentContact: "",
        dob: "",
        address: ""
    });

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const data = await StudentService.getById(id);
                setStudent(data);
                setFormData({
                    photoUrl: data.photoUrl || "",
                    parentContact: data.parentContact || "",
                    dob: data.dob || "",
                    address: data.address || ""
                });
            } catch (err: any) {
                console.error("Failed to fetch student", err);
                setError("Unable to load student profile. They may not exist or the server is down.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updated = await StudentService.update(id, {
                ...student,
                ...formData
            });
            setStudent(updated);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="flex-1 p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    {error || "Student not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Navigation */}
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Student Profile</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{student.admissionNumber}</span>
                        • {student.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: Profile Overview Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="px-6 pb-6 relative">
                            {/* Avatar */}
                            <div className="absolute -top-12 left-6 ring-4 ring-card bg-muted w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-md">
                                {student.photoUrl ? (
                                    <img src={student.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-muted-foreground/50" />
                                )}
                            </div>

                            <div className="pt-14 mt-1">
                                <h3 className="text-xl font-bold">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${student.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                        {student.status}
                                    </span>
                                </div>
                            </div>

                            <hr className="my-5 border-border" />

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span className="font-medium text-foreground">{student.parentContact || "No contact provided"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span>{student.dob ? new Date(student.dob).toLocaleDateString() : "DOB unknown"}</span>
                                </div>
                                <div className="flex items-start gap-3 text-muted-foreground">
                                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{student.address || "No address provided"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2 & 3: Editing and Metrics */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Academic Records Placeholder */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold">Academic Records</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Examination results and performance history for {student.name}.</p>
                        <div className="rounded-lg border border-dashed border-border py-10 text-center text-muted-foreground">
                            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No exam records available yet.</p>
                            <p className="text-xs mt-1">Results will appear here once exams are graded.</p>
                        </div>
                    </div>

                    {/* Edit Form Card */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/20">
                            <h3 className="text-lg font-bold">Edit Profile Elements</h3>
                            <p className="text-sm text-muted-foreground">Update contact info, address, or supply an external photo URL.</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSaveProfile} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5 text-muted-foreground">
                                            <ImageIcon className="w-4 h-4" /> Photo URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                            placeholder="https://example.com/photo.jpg"
                                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5 text-muted-foreground">
                                            <Phone className="w-4 h-4" /> Parent Contact
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.parentContact}
                                            onChange={e => setFormData({ ...formData, parentContact: e.target.value })}
                                            placeholder="+1 234 567 8900"
                                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5 text-muted-foreground">
                                            <Calendar className="w-4 h-4" /> Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin className="w-4 h-4" /> Address
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Full mailing address..."
                                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-primary hover:bg-blue-600 disabled:opacity-50 text-primary-foreground px-5 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
