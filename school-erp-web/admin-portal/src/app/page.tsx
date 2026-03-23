import Link from 'next/link';
import { ShieldCheck, GraduationCap, Users, BookOpen, Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <BrainCircuit className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-slate-300">Next-Gen AI Powered Learning</span>
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>

        {/* Headlines */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              LMNO ERP
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            The intelligent, AI-based LMS platform elevating education to the next level. Seamlessly connecting Admins, Teachers, Students, and Parents.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="w-full mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both">
          
          {/* Admin */}
          <Link href="/login" className="group">
            <div className="h-full flex flex-col items-start p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Admin Portal</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                Full-scale institutional management, automated timetables, and system configurations.
              </p>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm group-hover:gap-3 transition-all mt-auto">
                Access Gateway <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Teacher */}
          <Link href="/teacher" className="group">
            <div className="h-full flex flex-col items-start p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-2xl bg-teal-500/20 text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Teacher Portal</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                Manage your classrooms, take attendance, view personalized schedules, and monitor student progress.
              </p>
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm group-hover:gap-3 transition-all mt-auto">
                Access Gateway <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Student */}
          <Link href="/student" className="group">
            <div className="h-full flex flex-col items-start p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Student Portal</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                Your AI-powered learning hub. Access courses, view your timetable, and complete assignments.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all mt-auto">
                Access Gateway <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Parent */}
          <Link href="/parent" className="group">
            <div className="h-full flex flex-col items-start p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Parent Portal</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                Stay connected with your child's academic journey. Monitor attendance, grades, and fee payments.
              </p>
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all mt-auto">
                Access Gateway <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
