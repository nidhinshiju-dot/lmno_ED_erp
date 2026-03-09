"use client";

import { useEffect, useState } from "react";
import { CourseService, StaffService } from "@/lib/api";
import { Plus, Search, BookOpen, Loader2, PlayCircle, Clock } from "lucide-react";

interface Course {
    id: string;
    title: string;
    description: string;
    teacherId: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newCourse, setNewCourse] = useState({
        title: "",
        description: "",
        teacherId: ""
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [courseData, staffData] = await Promise.all([
                    CourseService.getAll(),
                    StaffService.getAll()
                ]);
                setCourses(courseData);
                setStaff(staffData);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch courses. Ensure the API Gateway and LMS Service are both running.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await CourseService.create({
                ...newCourse,
                teacherId: newCourse.teacherId || "DEFAULT-TEACHER"
            });
            setCourses([...courses, res]);
            setIsModalOpen(false);
            setNewCourse({ title: "", description: "", teacherId: "" });
        } catch {
            alert("Failed to create course");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Academics & LMS</h2>
                    <p className="text-muted-foreground mt-1">Manage global curriculum, courses and lesson planning.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" /> Create Course
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search our catalog of courses..."
                        className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Syncing course catalog from the LMS Service...</p>
                </div>
            ) : error ? (
                <div className="p-8 text-center text-red-400 bg-red-500/5 rounded-xl border border-red-500/20">
                    <BookOpen className="w-10 h-10 mx-auto text-red-400 mb-3 opacity-50" />
                    {error}
                </div>
            ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border border-dashed">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No courses published yet</h3>
                    <p className="text-muted-foreground text-sm mt-1 max-w-sm text-center">Get started by creating your very first multi-tenant academic course block for teachers.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-6 text-primary text-sm font-medium hover:underline">
                        + Quick Add Course
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="group bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/50 transition-all hover:shadow-md cursor-pointer flex flex-col">
                            <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 relative">
                                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded w-fit text-xs font-medium border border-border/50">
                                    ID: {course.id.substring(0, 8)}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{course.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed flex-1">
                                    {course.description || "No description provided for this academic block."}
                                </p>

                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded">
                                        <Clock className="w-3.5 h-3.5" /> 16 Weeks
                                    </div>
                                    <div className="flex items-center gap-1.5 text-primary font-medium group-hover:underline">
                                        <PlayCircle className="w-3.5 h-3.5" /> View Syllabus
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="text-primary w-5 h-5" /> Draft New Course</h3>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Course Title *</label>
                                <input required type="text" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Introduction to Calculus" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Course Description</label>
                                <textarea rows={3} value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Provide an academic overview..." />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Assigned Teacher</label>
                                <select value={newCourse.teacherId} onChange={e => setNewCourse({ ...newCourse, teacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select a Course Instructor...</option>
                                    {staff.filter((s: any) => s.department === "Teaching").map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg transition-colors relative">
                                    Publish Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
