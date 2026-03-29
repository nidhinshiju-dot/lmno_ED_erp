"use client";

import { useEffect, useState } from "react";
import { SchoolService } from "@/lib/api";
import { Building2, Plus, ToggleLeft, ToggleRight, Loader2, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface School {
  id: string;
  name: string;
  contactEmail: string;
  active: boolean;
  createdAt?: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { loadSchools(); }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getAll();
      setSchools(data || []);
    } catch {
      console.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const updated = await SchoolService.toggle(id);
      setSchools(schools.map(s => s.id === id ? updated : s));
    } catch {
      alert("Failed to toggle status");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
      <PageHeader
        title="Tenants"
        subtitle="All schools onboarded to the LMNO platform."
        breadcrumbs={[{ label: "Tenants" }]}
        actions={
          <Link
            href="/schools/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white text-sm font-semibold rounded-xl hover:bg-[hsl(var(--primary))]/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Onboard Tenant
          </Link>
        }
      />

      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">

        {/* Table header */}
        {!loading && schools.length > 0 && (
          <div className="px-6 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
            <p className="text-[13px] text-[hsl(var(--muted-foreground))]">
              <span className="font-semibold text-[hsl(var(--foreground))]">{schools.length}</span> tenant{schools.length !== 1 ? "s" : ""} registered
            </p>
            <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">Click a row to manage</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[hsl(var(--muted-foreground))]">
            <Loader2 className="w-6 h-6 animate-spin mb-3" />
            <p className="text-sm">Loading tenants...</p>
          </div>
        ) : schools.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No tenants onboarded"
            description="Get started by provisioning your first school tenant."
            action={
              <Link href="/schools/new" className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white text-sm font-semibold rounded-xl hover:bg-[hsl(var(--primary))]/90 transition-colors">
                <Plus className="w-4 h-4" /> Onboard First Tenant
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">School</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] hidden md:table-cell">Onboarded</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {schools.map((school) => (
                  <tr
                    key={school.id}
                    className="hover:bg-[hsl(var(--muted))]/40 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/schools/${school.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">
                            {school.name}
                          </p>
                          <p className="text-[11px] font-mono text-[hsl(var(--muted-foreground))] mt-0.5">{school.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <p className="text-[13px] text-[hsl(var(--muted-foreground))]">{school.contactEmail || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        school.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${school.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {school.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-[13px] text-[hsl(var(--muted-foreground))]">
                        {school.createdAt
                          ? new Date(school.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleToggle(e, school.id)}
                          title={school.active ? "Suspend tenant" : "Restore tenant"}
                          className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          {school.active
                            ? <ToggleRight className="w-5 h-5 text-emerald-600" />
                            : <ToggleLeft className="w-5 h-5" />
                          }
                        </button>
                        <button
                          onClick={() => router.push(`/schools/${school.id}`)}
                          title="View tenant"
                          className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-blue-50 transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
