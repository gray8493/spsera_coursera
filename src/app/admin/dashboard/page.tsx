import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { RequestTable } from "@/components/RequestTable";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const requests = await db.courseraRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const initialData = requests.map((request) => ({
    id: request.id,
    email: request.email,
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">Coursera Admin Dashboard</h1>
            <p className="text-xs text-slate-500">Xin chào, {session.username}</p>
          </div>
          <a href="/api/admin/logout" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50">
            Đăng xuất
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RequestTable initialData={initialData} />
      </main>
    </div>
  );
}
