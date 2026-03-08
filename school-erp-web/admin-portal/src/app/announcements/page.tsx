"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { AnnouncementService } from "@/lib/api";
import { Plus, Megaphone, Trash2 } from "lucide-react";

interface AnnouncementItem { id: string; title: string; content: string; scope: string; priority: string; createdAt: string; createdBy: string; }

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAnn, setNewAnn] = useState({ title: "", content: "", scope: "SCHOOL", priority: "NORMAL" });

    useEffect(() => {
        const load = async () => {
            try { setAnnouncements(await AnnouncementService.getAll()); } catch {}
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await AnnouncementService.create(newAnn);
            setAnnouncements([created, ...announcements]);
            setIsModalOpen(false);
            setNewAnn({ title: "", content: "", scope: "SCHOOL", priority: "NORMAL" });
        } catch { alert("Failed"); }
    };

    const handleDelete = async (id: string) => {
        try {
            await AnnouncementService.deactivate(id);
            setAnnouncements(announcements.filter(a => a.id !== id));
        } catch { alert("Failed"); }
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = { HIGH: "bg-red-100 text-red-700", NORMAL: "bg-blue-100 text-blue-700", LOW: "bg-gray-100 text-gray-600" };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[priority] || colors.NORMAL}`}>{priority}</span>;
    };

    const getScopeBadge = (scope: string) => {
        const colors: Record<string, string> = { SCHOOL: "bg-indigo-100 text-indigo-700", CLASS: "bg-emerald-100 text-emerald-700", TEACHER: "bg-purple-100 text-purple-700", PARENT: "bg-orange-100 text-orange-700" };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[scope] || "bg-gray-100 text-gray-600"}`}>{scope}</span>;
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Announcements" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
                            <p className="text-muted-foreground mt-1">Create and manage school-wide or targeted announcements.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                            <Plus className="w-4 h-4" /> New Announcement
                        </button>
                    </div>

                    {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : announcements.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-40" />No announcements yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {announcements.map(ann => (
                                <div key={ann.id} className="bg-card border border-border rounded-xl p-5 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getPriorityBadge(ann.priority)}
                                                {getScopeBadge(ann.scope)}
                                            </div>
                                            <h3 className="font-bold text-lg">{ann.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                                            <p className="text-xs text-muted-foreground mt-3">{ann.createdAt ? new Date(ann.createdAt).toLocaleString() : "Just now"}</p>
                                        </div>
                                        <button onClick={() => handleDelete(ann.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold mb-4">New Announcement</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className="text-sm font-medium mb-1 block">Title *</label>
                                <input required type="text" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Important Notice" />
                            </div>
                            <div><label className="text-sm font-medium mb-1 block">Content</label>
                                <textarea value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} rows={4} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Write your announcement..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Scope</label>
                                    <select value={newAnn.scope} onChange={e => setNewAnn({...newAnn, scope: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="SCHOOL">School-wide</option>
                                        <option value="CLASS">Class</option>
                                        <option value="TEACHER">Teachers</option>
                                        <option value="PARENT">Parents</option>
                                    </select>
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Priority</label>
                                    <select value={newAnn.priority} onChange={e => setNewAnn({...newAnn, priority: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Publish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
