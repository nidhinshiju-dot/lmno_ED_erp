"use client";

import Header from "@/components/Header";
import { Building2, Palette, Globe, GraduationCap, Clock, ImageIcon, Save, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [savedTab, setSavedTab] = useState<string | null>(null);

    const handleSave = (tab: string) => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSavedTab(tab);
            setTimeout(() => setSavedTab(null), 3000);
        }, 800);
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                        <p className="text-muted-foreground mt-1">Manage your school profile, branding, and preferences.</p>
                    </div>

                    {/* School Profile */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4 relative overflow-hidden group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold">School Profile</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-sm font-medium">School Name</label>
                                <input type="text" defaultValue="Springfield Elementary" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Contact Email</label>
                                <input type="email" defaultValue="admin@school.app" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Phone</label>
                                <input type="text" defaultValue="+91 98765 43210" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Academic Year</label>
                                <input type="text" defaultValue="2025-2026" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Address</label>
                                <input type="text" defaultValue="123 Education Lane" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Principal Name</label>
                                <input type="text" defaultValue="Dr. Ananya Mehta" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                        </div>
                        <div className="pt-2">
                            <button onClick={() => handleSave("profile")} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                                {savedTab === "profile" ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    </div>

                    {/* School Branding */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold">Branding</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">School Logo</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center text-2xl">🏫</div>
                                    <button className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors">Upload Logo</button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Primary Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" defaultValue="#3B82F6" className="w-10 h-10 rounded cursor-pointer border-none" />
                                    <span className="text-sm text-muted-foreground">#3B82F6</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timezone & Language */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><Globe className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold">Locale & Timezone</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-sm font-medium">Language</label>
                                <select className="w-full p-2 border border-border rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option>English</option><option>Hindi</option><option>Tamil</option><option>Marathi</option><option>Bengali</option>
                                </select></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Timezone</label>
                                <select className="w-full p-2 border border-border rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option>Asia/Kolkata (IST, UTC+5:30)</option><option>Asia/Dubai (GST, UTC+4)</option><option>America/New_York (EST, UTC-5)</option><option>Europe/London (GMT, UTC+0)</option>
                                </select></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Date Format</label>
                                <select className="w-full p-2 border border-border rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                                </select></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Currency</label>
                                <select className="w-full p-2 border border-border rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option>₹ INR</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option>
                                </select></div>
                        </div>
                        <div className="pt-2">
                            <button onClick={() => handleSave("locale")} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                                {savedTab === "locale" ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Preferences</>}
                            </button>
                        </div>
                    </div>

                    {/* Grading Scale */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold">Grading Scale</h3>
                        </div>
                        <div className="space-y-2">
                            {[{ grade:"A+", min:90, max:100, color:"bg-emerald-100 text-emerald-700" },{ grade:"A", min:80, max:89, color:"bg-green-100 text-green-700" },{ grade:"B+", min:70, max:79, color:"bg-blue-100 text-blue-700" },{ grade:"B", min:60, max:69, color:"bg-sky-100 text-sky-700" },{ grade:"C", min:50, max:59, color:"bg-yellow-100 text-yellow-700" },{ grade:"D", min:40, max:49, color:"bg-orange-100 text-orange-700" },{ grade:"F", min:0, max:39, color:"bg-red-100 text-red-700" }].map(g => (
                                <div key={g.grade} className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <span className={`w-10 text-center px-2 py-1 rounded-full text-xs font-bold ${g.color}`}>{g.grade}</span>
                                    <div className="flex items-center gap-2 text-sm">
                                        <input type="number" defaultValue={g.min} className="w-16 bg-muted border border-border rounded px-2 py-1 text-center text-sm" /> —
                                        <input type="number" defaultValue={g.max} className="w-16 bg-muted border border-border rounded px-2 py-1 text-center text-sm" /> %
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-2">
                            <button onClick={() => handleSave("grading")} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                                {savedTab === "grading" ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Grading Scale</>}
                            </button>
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold">Working Hours</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-sm font-medium">School Start Time</label>
                                <input type="time" defaultValue="08:00" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">School End Time</label>
                                <input type="time" defaultValue="15:30" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Period Duration (min)</label>
                                <input type="number" defaultValue="45" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div className="space-y-1"><label className="text-sm font-medium">Working Days</label>
                                <select className="w-full p-2 border border-border rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option>Mon-Fri</option><option>Mon-Sat</option><option>Mon-Sun</option>
                                </select></div>
                        </div>
                        <div className="pt-2">
                            <button onClick={() => handleSave("hours")} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                                {savedTab === "hours" ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Hours</>}
                            </button>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center"><Palette className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold">Appearance</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium">Theme</p><p className="text-xs text-muted-foreground">Choose your preferred color mode.</p></div>
                            <select className="p-2 border border-border rounded-lg bg-muted text-sm" onChange={() => handleSave("theme")}>
                                <option>Dark</option><option>Light</option><option>System</option>
                            </select>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
