import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white border border-app-border p-5 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-app-bg rounded-md border border-app-border">
          <Icon className="h-5 w-5 text-app-text" />
        </div>
        {trend && (
          <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded border", trendUp ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-app-muted bg-app-bg border-app-border")}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-[11px] font-bold text-app-muted uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-bold text-app-text mt-1">{value ?? "—"}</div>
    </div>
  )
}
