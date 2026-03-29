import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number | null;
  icon: LucideIcon;
  accent: "blue" | "purple" | "emerald" | "amber" | "rose";
  emptyStateText?: string;
  trend?: string;
}

const accentMap = {
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600",   ring: "ring-blue-100"   },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-600", ring: "ring-purple-100" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600",ring: "ring-emerald-100"},
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600",  ring: "ring-amber-100"  },
  rose:    { bg: "bg-rose-50",    icon: "text-rose-600",   ring: "ring-rose-100"   },
};

export function MetricCard({
  label, value, icon: Icon, accent, emptyStateText = "Pending integration", trend
}: MetricCardProps) {
  const colors = accentMap[accent];
  const hasValue = value !== null && value !== undefined && value !== 0 && value !== "0";

  return (
    <div className="bg-white rounded-2xl p-5 border border-[hsl(var(--border))] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.ring} ring-1 flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${colors.icon}`} strokeWidth={2} />
        </div>
        {hasValue && trend && (
          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>

      {hasValue ? (
        <>
          <p className="text-[28px] font-bold text-[hsl(var(--foreground))] leading-none tracking-tight">{value}</p>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1.5 font-medium">{label}</p>
        </>
      ) : (
        <>
          <p className="text-[28px] font-bold text-[hsl(var(--border))] leading-none tracking-tight">—</p>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1.5 font-medium">{label}</p>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]/70 mt-1 font-medium">{emptyStateText}</p>
        </>
      )}
    </div>
  );
}
