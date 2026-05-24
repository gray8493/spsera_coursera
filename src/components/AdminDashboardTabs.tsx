"use client";

import { useState } from "react";
import { LayoutGrid, LineChart } from "lucide-react";
import { RequestTable, type CourseraRequestRow } from "@/components/RequestTable";
import { AdminStatsPanel } from "@/components/AdminStatsPanel";

type DailyVisit = {
  day: string;
  count: number;
};

type DashboardStats = {
  totalVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  paidRequests: number;
  revenue: number;
  dailyVisits: DailyVisit[];
};

type AdminDashboardTabsProps = {
  initialRequests: CourseraRequestRow[];
  stats: DashboardStats;
};

const TABS = [
  {
    id: "requests",
    label: "Yêu cầu",
    icon: LayoutGrid,
  },
  {
    id: "statistics",
    label: "Thống kê",
    icon: LineChart,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminDashboardTabs({ initialRequests, stats }: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("requests");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-slate-950 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "requests" ? (
        <RequestTable initialData={initialRequests} />
      ) : (
        <AdminStatsPanel {...stats} />
      )}
    </div>
  );
}
