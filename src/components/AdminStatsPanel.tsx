"use client";

import type { ReactNode } from "react";
import { BarChart3, CalendarDays, ListChecks, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DailyVisit = {
  day: string;
  count: number;
};

type AdminStatsPanelProps = {
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

function StatCard({
  title,
  value,
  description,
  accent,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="flex items-start gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminStatsPanel({
  totalVisits,
  visitsToday,
  visitsLast7Days,
  totalRequests,
  pendingRequests,
  completedRequests,
  paidRequests,
  revenue,
  dailyVisits,
}: AdminStatsPanelProps) {
  const peakDay = dailyVisits.reduce<DailyVisit | null>((best, current) => {
    if (!best || current.count > best.count) return current;
    return best;
  }, null);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl">
        <CardHeader className="relative space-y-3 p-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              Thống kê
            </span>
          </div>
          <CardTitle className="text-2xl text-white">Theo dõi lượt truy cập và hiệu suất vận hành</CardTitle>
          <CardDescription className="max-w-3xl text-sm text-slate-300">
            Tab này hiển thị tổng quan traffic của website cùng các chỉ số xử lý request để bạn nắm nhanh tình trạng hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 pt-0 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Tổng lượt truy cập</p>
            <p className="mt-2 text-3xl font-black text-white">{totalVisits.toLocaleString("vi-VN")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Hôm nay</p>
            <p className="mt-2 text-3xl font-black text-white">{visitsToday.toLocaleString("vi-VN")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">7 ngày gần nhất</p>
            <p className="mt-2 text-3xl font-black text-white">{visitsLast7Days.toLocaleString("vi-VN")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng yêu cầu"
          value={totalRequests.toLocaleString("vi-VN")}
          description="Toàn bộ yêu cầu đã tiếp nhận"
          accent="bg-blue-50 text-blue-700"
          icon={<ListChecks className="h-5 w-5" />}
        />
        <StatCard
          title="Đang chờ xử lý"
          value={pendingRequests.toLocaleString("vi-VN")}
          description="Các request chưa xử lý xong"
          accent="bg-amber-50 text-amber-700"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          title="Đã hoàn thành"
          value={completedRequests.toLocaleString("vi-VN")}
          description="Đơn đã chuyển sang trạng thái hoàn tất"
          accent="bg-emerald-50 text-emerald-700"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Doanh thu xác nhận"
          value={`${revenue.toLocaleString("vi-VN")}₫`}
          description={`${paidRequests.toLocaleString("vi-VN")} đơn đã thanh toán`}
          accent="bg-purple-50 text-purple-700"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg text-slate-900">Dòng chảy truy cập 7 ngày</CardTitle>
            <CardDescription>Biểu diễn nhanh số lượt vào website theo từng ngày gần nhất.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyVisits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Chưa có dữ liệu truy cập
              </div>
            ) : (
              dailyVisits.map((item) => {
                const ratio = peakDay && peakDay.count > 0 ? (item.count / peakDay.count) * 100 : 0;
                return (
                  <div key={item.day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.day}</span>
                      <span className="font-semibold text-slate-900">{item.count.toLocaleString("vi-VN")}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${Math.max(ratio, item.count > 0 ? 12 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg text-slate-900">Tóm tắt nhanh</CardTitle>
            <CardDescription>Tỉ lệ vận hành hiện tại của dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tỉ lệ đơn hoàn thành</p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {totalRequests === 0 ? "0%" : `${Math.round((completedRequests / totalRequests) * 100)}%`}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Đơn đã thanh toán</p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {paidRequests.toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Lượt truy cập trong 7 ngày</p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {visitsLast7Days.toLocaleString("vi-VN")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
