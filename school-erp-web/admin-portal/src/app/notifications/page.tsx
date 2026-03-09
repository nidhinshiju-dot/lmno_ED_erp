"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { NotificationService, ClassService } from "@/lib/api";
import { Bell, CopyPlus, Smartphone, Send, ShieldAlert, Users } from "lucide-react";

interface ClassItem { id: string; name: string; }
interface BroadcastLog { id: string; title: string; message: string; type: string; createdAt: string; referenceId: string; }

export default function NotificationsPage() {
    const [history, setHistory] = useState<BroadcastLog[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [payload, setPayload] = useState({ title: "", message: "", scope: "ALL", targetId: "" });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch broadcast history (userId="BROADCAST")
                const hist = await NotificationService.getByUser("BROADCAST");
                setHistory(hist);
                
                // Fetch classes for dropdown
                const cls = await ClassService.getAll();
                setClasses(cls);
            } catch (e) {
                console.error("Failed to load notifications", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await NotificationService.broadcast(payload);
            
            // Reload history
            const hist = await NotificationService.getByUser("BROADCAST");
            setHistory(hist);
            setPayload({ title: "", message: "", scope: "ALL", targetId: "" });
            
            alert("Push notification successfully scheduled for delivery via FCM!");
        } catch (err) {
            alert("Failed to broadcast notification");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Panel: Composer */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Smartphone className="w-24 h-24" />
                            </div>
                            
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                                <Send className="w-5 h-5 text-indigo-500" />
                                Compose Broadcast
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">Instantly alert mobile devices via Firebase payloads.</p>
                            
                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Audience Target *</label>
                                    <select required value={payload.scope} onChange={e => setPayload({...payload, scope: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                                        <option value="ALL">Entire School (Students & Staff)</option>
                                        <option value="TEACHERS">All Teachers Only</option>
                                        <option value="PARENTS">All Parents Only</option>
                                        <option value="CLASS">Specific Class / Branch</option>
                                    </select>
                                </div>
                                
                                {payload.scope === "CLASS" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-sm font-medium mb-1 block">Select Target Class *</label>
                                        <select required value={payload.targetId} onChange={e => setPayload({...payload, targetId: e.target.value})} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Choose a class...</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Notification Title *</label>
                                    <input required type="text" maxLength={60} value={payload.title} onChange={e => setPayload({...payload, title: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Weather Alert: School Closed" />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium mb-1 block flex items-center justify-between">
                                        Message Body *
                                        <span className="text-xs text-muted-foreground">{payload.message.length}/200</span>
                                    </label>
                                    <textarea required rows={4} maxLength={200} value={payload.message} onChange={e => setPayload({...payload, message: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Enter the push notification content..." />
                                </div>
                                
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p>Messages include a <span className="font-mono bg-amber-100 px-1 rounded">VIEW_MESSAGE</span> intent. Mobile apps will auto-open this text when users tap the notification tray.</p>
                                </div>
                                
                                <button type="submit" disabled={isSending} className="w-full justify-center px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
                                    {isSending ? "Dispatching..." : "Send Mass Notification"}
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    {/* Right Panel: History Log */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold tracking-tight">Broadcast History Logs</h3>
                        </div>
                        
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">Loading gateway history...</div>
                            ) : history.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/50 m-4 rounded-xl">
                                    <Bell className="w-12 h-12 text-muted-foreground opacity-30 mb-3" />
                                    <h4 className="text-lg font-medium">No Push Broadcasts Sent</h4>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">Mobile push notifications sent via this module will appear here for auditing.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border overflow-y-auto max-h-[800px]">
                                    {history.map(item => (
                                        <div key={item.id} className="p-5 hover:bg-muted/20 transition-colors flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100 mt-1">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-foreground text-base leading-tight mb-1">{item.title}</h4>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.message}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-xs text-muted-foreground mb-1">
                                                            {new Date(item.createdAt).toLocaleString(undefined, {
                                                                month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                                                            })}
                                                        </div>
                                                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                                                            <Users className="w-3 h-3" />
                                                            {item.referenceId ? `TGT: ${item.referenceId}` : "GLOBAL"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
