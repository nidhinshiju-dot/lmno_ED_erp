"use client";

import Header from "@/components/Header";
import { Plus, Calendar as CalendarIcon, MapPin, Trash2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { SchoolManagementService } from "@/lib/api";

type AcademicEvent = {
    id: string;
    title: string;
    description: string;
    eventDate: string;
    endDate: string | null;
    type: string;
    active: boolean;
};

export default function CalendarPage() {
    const [events, setEvents] = useState<AcademicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        eventDate: "",
        endDate: "",
        type: "HOLIDAY"
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await SchoolManagementService.getCalendar();
            setEvents(data);
        } catch (error) {
            console.error("Failed to load calendar events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await SchoolManagementService.createEvent({
                ...formData,
                endDate: formData.endDate || null
            });
            setIsAdding(false);
            setFormData({ title: "", description: "", eventDate: "", endDate: "", type: "HOLIDAY" });
            loadEvents();
        } catch (error) {
            console.error("Failed to create event", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            await SchoolManagementService.deleteEvent(id);
            loadEvents();
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'HOLIDAY': return 'bg-green-100 text-green-700 border-green-200';
            case 'EXAM': return 'bg-red-100 text-red-700 border-red-200';
            case 'ACTIVITY': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Academic Calendar</h2>
                            <p className="text-muted-foreground mt-1">Manage school holidays, exams, and activities.</p>
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Event
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6 animate-in slide-in-from-top-4">
                            <h3 className="text-lg font-bold mb-4">New Event Details</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Event Title</label>
                                        <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Summer Break" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Event Type</label>
                                        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                            <option value="HOLIDAY">Holiday</option>
                                            <option value="EXAM">Exam Period</option>
                                            <option value="ACTIVITY">School Activity</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Start Date</label>
                                        <input required type="date" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">End Date (Optional)</label>
                                        <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={2} placeholder="Brief description of the event..." />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Save Event</button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold">Upcoming Events</h3>
                        </div>
                        <div className="divide-y divide-border">
                            {loading ? (
                                <p className="p-6 text-sm text-center text-muted-foreground">Loading calendar schedule...</p>
                            ) : events.length === 0 ? (
                                <p className="p-6 text-sm text-center text-muted-foreground">No upcoming events scheduled.</p>
                            ) : (
                                events.map(event => {
                                    const eventDate = new Date(event.eventDate);
                                    return (
                                        <div key={event.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors group">
                                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-muted border border-border flex flex-col items-center justify-center overflow-hidden">
                                                <div className="w-full bg-red-500 text-white text-[10px] font-bold text-center uppercase tracking-wider py-0.5">
                                                    {eventDate.toLocaleString('default', { month: 'short' })}
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">
                                                    {eventDate.getDate()}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-lg">{event.title}</h4>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getEventTypeColor(event.type)}`}>
                                                        {event.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2 sm:mb-0 line-clamp-2">{event.description || "No description provided."}</p>
                                                {event.endDate && (
                                                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Clock className="w-3.5 h-3.5" /> 
                                                        Ends on {new Date(event.endDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
