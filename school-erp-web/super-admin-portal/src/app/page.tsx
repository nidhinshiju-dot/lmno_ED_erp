"use client";

import { Building2, Settings, Users, Activity, Menu, Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col bg-card border-r border-border transition-all duration-300`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-primary truncate">Platform Admin</h1>
          ) : (
            <h1 className="text-xl font-bold text-primary mx-auto">PA</h1>
          )}
          <Menu 
            className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground hidden md:block" 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
          />
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
            <Activity className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link href="/schools" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Building2 className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Schools</span>}
          </Link>
          <Link href="/platform-users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Users className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Global Users</span>}
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0">
                    S
                </div>
                {isSidebarOpen && (
                    <div className="truncate">
                        <p className="text-sm font-semibold">Super Admin</p>
                        <p className="text-xs text-muted-foreground truncate">root@platform.com</p>
                    </div>
                )}
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border">
          <div className="flex items-center gap-4">
             <Menu className="w-5 h-5 cursor-pointer md:hidden block" onClick={() => setSidebarOpen(!isSidebarOpen)} />
             <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

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
      </main>

    </div>
  );
}
