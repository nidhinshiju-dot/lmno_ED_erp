import { Building2, Hash, CalendarDays, Wifi, WifiOff } from "lucide-react";

interface TenantHeaderProps {
  name: string;
  tenantId: string;
  active: boolean;
  plan?: string;
  createdAt?: string;
}

export function TenantHeader({ name, tenantId, active, plan = "Free UAT", createdAt }: TenantHeaderProps) {
  return (
    <div className="bg-white border border-[hsl(var(--border))] rounded-2xl px-6 py-4 mb-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-[18px] h-[18px] text-blue-600" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-[hsl(var(--foreground))] leading-tight">{name}</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">Viewing tenant context</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[hsl(var(--border))]" />

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono font-medium text-[hsl(var(--foreground))]">{tenantId}</span>
          </span>

          {createdAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 flex-shrink-0" />
              <span>Onboarded {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </span>
          )}

          <span className="flex items-center gap-1.5">
            {active ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-red-400" />}
            <span className={`font-semibold ${active ? "text-emerald-600" : "text-red-500"}`}>
              {active ? "Active" : "Suspended"}
            </span>
          </span>

          <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-medium text-[11px]">
            {plan}
          </span>
        </div>
      </div>
    </div>
  );
}
