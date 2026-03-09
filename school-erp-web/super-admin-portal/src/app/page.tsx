"use client";

import { Building2, Users, Activity } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
        <div className="flex-1 overflow-auto p-6 lg:p-10 space-y-8 pb-20">
          
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-3xl font-bold tracking-tight">Platform Insights</h3>
              <p className="text-muted-foreground">Monitor the health and growth of your SaaS tenant ecosystem.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Active Schools
                    </p>
                    <h4 className="text-4xl font-bold">0</h4>
                    <p className="text-sm text-emerald-600 font-medium">No recent additions</p>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" /> Total Students
                    </p>
                    <h4 className="text-4xl font-bold">0</h4>
                    <p className="text-sm text-emerald-600 font-medium">No recent additions</p>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Platform Uptime
                    </p>
                    <h4 className="text-4xl font-bold">99.98%</h4>
                    <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                 <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
                 <div className="flex flex-wrap gap-4">
                    <Link href="/schools/new" className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
                        Onboard New School
                    </Link>
                    <button className="px-5 py-2.5 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors border border-border">
                        Review Billing
                    </button>
                    <button className="px-5 py-2.5 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors border border-border">
                        System Logs
                    </button>
                 </div>
            </div>

          </div>

        </div>
  );
}
