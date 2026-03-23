"use client";

import { useAuth } from "@/components/AuthProvider";
import { Users, GraduationCap, IndianRupee, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentService, StaffService } from "@/lib/api";
import AdminCopilot from "@/components/AdminCopilot";

const mockChartData = [
  { name: 'Jan', revenue: 0, attendance: 0 },
  { name: 'Feb', revenue: 0, attendance: 0 },
  { name: 'Mar', revenue: 0, attendance: 0 },
  { name: 'Apr', revenue: 0, attendance: 0 },
  { name: 'May', revenue: 0, attendance: 0 },
  { name: 'Jun', revenue: 0, attendance: 0 },
  { name: 'Jul', revenue: 0, attendance: 0 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState<number | string>("...");
  const [staffCount, setStaffCount] = useState<number | string>("...");

  useEffect(() => {
    StudentService.getAll()
      .then(res => setStudentCount(res.length))
      .catch((e) => setStudentCount(0));
      
    StaffService.getAll()
      .then(res => setStaffCount(res.length))
      .catch(() => setStaffCount(0));
  }, []);

  const stats = [
    { label: "Total Students", value: studentCount, icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Staff", value: staffCount, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Revenue Collected", value: "₹0", icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Average Attendance", value: "0%", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name || "Admin"}! Here&apos;s what&apos;s happening today.</p>
      </div>



      {/* Main Content & Elsa Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Content (KPIs, Charts & Recent Activity) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 hover:border-gray-600 transition-colors shadow-sm">
                  <div className={`p-4 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Main Chart Area */}
          <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Revenue vs Attendance Overview</h3>
              <select className="bg-muted border border-border text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Last 7 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area yAxisId="right" type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Panel Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Recent Enrollments</h3>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <GraduationCap className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">No recent enrollments</p>
                <p className="text-xs text-muted-foreground mt-1">New students will appear here.</p>
              </div>
            </div>
            
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
               <h3 className="font-semibold text-lg mb-4">Tasks</h3>
               <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-medium text-foreground">All caught up!</p>
               </div>
            </div>
          </div>

        </div>

        {/* Right Content (Elsa AI) */}
        <div className="xl:col-span-1 border-l border-border pl-0 xl:pl-6">
           <div className="sticky top-6">
             <AdminCopilot />
           </div>
        </div>

      </div>
    </div>
  );
}
