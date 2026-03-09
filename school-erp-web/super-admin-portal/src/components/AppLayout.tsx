"use client";

import { Building2, Settings, Users, Activity, Menu, Bell, LogOut, Bot } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  // Don't show layout on login page
  if (pathname === '/login') {
      return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col bg-card border-r border-border transition-all duration-300 absolute md:relative z-50 h-full ${!isSidebarOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-primary truncate">Platform Admin</h1>
          ) : (
            <h1 className="text-xl font-bold text-primary mx-auto hidden md:block">PA</h1>
          )}
          <Menu 
            className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground md:block" 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
          />
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname === '/' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
            <Activity className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link href="/schools" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.startsWith('/schools') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
            <Building2 className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Schools</span>}
          </Link>
          <Link href="/platform-users" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.startsWith('/platform-users') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
            <Users className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Global Users</span>}
          </Link>
          <Link href="/ai-insights" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.startsWith('/ai-insights') ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-100' : 'text-muted-foreground hover:bg-muted'}`}>
            <Bot className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/ai-insights') ? 'text-indigo-600' : 'text-indigo-500'}`} />
            {isSidebarOpen && <span>Platform AI Insights</span>}
          </Link>
          <Link href="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname.startsWith('/settings') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0">
                    {user?.name?.charAt(0) || "S"}
                </div>
                {isSidebarOpen && (
                    <div className="truncate">
                        <p className="text-sm font-semibold">{user?.name || "Super Admin"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@platform.com"}</p>
                    </div>
                )}
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full relative min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
             <Menu className="w-5 h-5 cursor-pointer md:hidden block" onClick={() => setSidebarOpen(!isSidebarOpen)} />
             <h2 className="text-lg font-semibold text-foreground capitalize">
                 {pathname === '/' ? 'Overview' : pathname.split('/')[1].replace('-', ' ')}
             </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={logout} className="p-2 flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/50">
            {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden block"
            onClick={() => setSidebarOpen(false)}
          />
      )}
    </div>
  );
}
