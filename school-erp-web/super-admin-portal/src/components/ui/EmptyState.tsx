import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center w-full ${compact ? "py-10 px-4" : "py-16 px-6"}`}>
      <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[hsl(var(--muted-foreground))]" strokeWidth={1.5} />
      </div>
      <h3 className="text-[15px] font-semibold text-[hsl(var(--foreground))] mb-1">{title}</h3>
      <p className="text-[13px] text-[hsl(var(--muted-foreground))] max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
