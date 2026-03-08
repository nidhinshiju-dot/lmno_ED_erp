"use client";

import { useState } from "react";

interface SchoolSubscription {
    id: string;
    schoolName: string;
    plan: string;
    status: string;
    students: number;
    expiresAt: string;
    monthlyRevenue: number;
}

const mockData: SchoolSubscription[] = [
    { id: "1", schoolName: "Delhi Public School", plan: "Enterprise", status: "ACTIVE", students: 2400, expiresAt: "2027-03-15", monthlyRevenue: 25000 },
    { id: "2", schoolName: "St. Mary's Convent", plan: "Professional", status: "ACTIVE", students: 1200, expiresAt: "2026-12-01", monthlyRevenue: 15000 },
    { id: "3", schoolName: "Greenfield Academy", plan: "Starter", status: "TRIAL", students: 350, expiresAt: "2026-04-01", monthlyRevenue: 0 },
    { id: "4", schoolName: "Sunrise International", plan: "Professional", status: "EXPIRED", students: 800, expiresAt: "2026-01-15", monthlyRevenue: 0 },
];

export default function SubscriptionsPage() {
    const [schools] = useState<SchoolSubscription[]>(mockData);

    const totalRevenue = schools.reduce((sum, s) => sum + s.monthlyRevenue, 0);
    const activeCount = schools.filter(s => s.status === "ACTIVE").length;

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: "bg-emerald-100 text-emerald-700",
            TRIAL: "bg-blue-100 text-blue-700",
            EXPIRED: "bg-red-100 text-red-700",
            SUSPENDED: "bg-orange-100 text-orange-700",
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
    };

    return (
        <div className="flex-1 p-6 lg:p-10 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
                    <p className="text-muted-foreground mt-1">Manage school subscription plans and billing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                        <h3 className="text-4xl font-bold mt-1">{activeCount}</h3>
                    </div>
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                        <h3 className="text-4xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <p className="text-sm text-muted-foreground">Total Schools</p>
                        <h3 className="text-4xl font-bold mt-1">{schools.length}</h3>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <h3 className="font-semibold">All School Subscriptions</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 font-semibold text-muted-foreground">School</th>
                                <th className="p-4 font-semibold text-muted-foreground">Plan</th>
                                <th className="p-4 font-semibold text-muted-foreground">Students</th>
                                <th className="p-4 font-semibold text-muted-foreground">Expires</th>
                                <th className="p-4 font-semibold text-muted-foreground">Revenue/mo</th>
                                <th className="p-4 font-semibold text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map(s => (
                                <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    <td className="p-4 font-medium">{s.schoolName}</td>
                                    <td className="p-4">{s.plan}</td>
                                    <td className="p-4 font-mono">{s.students.toLocaleString()}</td>
                                    <td className="p-4">{s.expiresAt}</td>
                                    <td className="p-4 font-mono">₹{s.monthlyRevenue.toLocaleString()}</td>
                                    <td className="p-4">{getStatusBadge(s.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
