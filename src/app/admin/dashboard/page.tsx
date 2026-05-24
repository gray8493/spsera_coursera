import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { AdminDashboardTabs } from "@/components/AdminDashboardTabs";
import { CreateAdminAccountDialog } from "@/components/CreateAdminAccountDialog";

const BANGKOK_TIME_ZONE = "Asia/Bangkok";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getBangkokDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getBangkokDayLabel(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: BANGKOK_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [requests, visits] = await Promise.all([
    db.courseraRequest.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.visitEvent.findMany({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  const initialData = requests.map((request) => ({
    id: request.id,
    email: request.email,
    contactEmail: request.contactEmail,
    password: request.password,
    courseTarget: request.courseTarget,
    fptCode: request.fptCode,
    serviceType: request.serviceType,
    paymentAmount: request.paymentAmount,
    paymentStatus: request.paymentStatus,
    status: request.status,
    adminNotes: request.adminNotes,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  }));

  const requestStats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((request) => request.status === "PENDING").length,
    completedRequests: requests.filter((request) => request.status === "COMPLETED").length,
    paidRequests: requests.filter((request) => request.paymentStatus === "PAID" || request.paymentStatus === "VERIFIED").length,
    revenue: requests.reduce((sum, request) => sum + (request.paymentStatus !== "UNPAID" ? request.paymentAmount : 0), 0),
  };

  const todayKey = getBangkokDayKey(new Date());
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * DAY_IN_MS);
    return {
      key: getBangkokDayKey(date),
      day: getBangkokDayLabel(date),
    };
  });

  const visitCounts = new Map<string, number>();
  for (const visit of visits) {
    const key = getBangkokDayKey(visit.createdAt);
    visitCounts.set(key, (visitCounts.get(key) ?? 0) + 1);
  }

  const dailyVisits = recentDays.map((item) => ({
    day: item.day,
    count: visitCounts.get(item.key) ?? 0,
  }));

  const totalVisits = visits.length;
  const visitsToday = visitCounts.get(todayKey) ?? 0;
  const visitsLast7Days = dailyVisits.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Coursera Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Xin chào, {session.username}</p>
          </div>
          <div className="flex items-center gap-2">
            <CreateAdminAccountDialog />
            <a href="/api/admin/logout" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50">
              Đăng xuất
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminDashboardTabs
          initialRequests={initialData}
          stats={{
            totalVisits,
            visitsToday,
            visitsLast7Days,
            totalRequests: requestStats.totalRequests,
            pendingRequests: requestStats.pendingRequests,
            completedRequests: requestStats.completedRequests,
            paidRequests: requestStats.paidRequests,
            revenue: requestStats.revenue,
            dailyVisits,
          }}
        />
      </main>
    </div>
  );
}
