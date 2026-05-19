"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Eye, EyeOff, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { RequestDetailDialog } from "@/components/RequestDetailDialog";

export type RequestStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type CourseraRequestRow = {
  id: string;
  email: string;
  password: string;
  courseTarget: string | null;
  serviceType: string;
  paymentAmount: number;
  paymentStatus: string;
  status: RequestStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type RequestTableProps = {
  initialData?: CourseraRequestRow[];
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-amber-100 text-amber-800 border-amber-200" },
  PROCESSING: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETED: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  FAILED: { label: "Thất bại", className: "bg-red-100 text-red-800 border-red-200" },
};

const PAYMENT_LABELS: Record<string, { label: string; className: string }> = {
  UNPAID: { label: "Chưa TT", className: "bg-red-100 text-red-800 border-red-200" },
  PAID: { label: "Đã TT", className: "bg-amber-100 text-amber-800 border-amber-200" },
  VERIFIED: { label: "Xác nhận", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const SERVICE_LABELS: Record<string, string> = {
  FULL_SUPPORT: "Toàn diện (79K)",
  SKIP_VIDEO: "Skip Video & Reading (20K)",
};

export function RequestTable({ initialData = [] }: RequestTableProps) {
  const [requests, setRequests] = useState<CourseraRequestRow[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<CourseraRequestRow | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests");
      if (!res.ok) throw new Error("Unauthorized");
      const json = await res.json();
      setRequests(json.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData.length === 0) {
      fetchRequests();
    }
  }, [fetchRequests, initialData.length]);

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateField = async (id: string, field: string, value: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!res.ok) throw new Error("Lỗi cập nhật");
      const json = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? json.data : r)));
      toast.success("Đã cập nhật");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi");
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      searchTerm === "" ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.courseTarget ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchPayment = paymentFilter === "ALL" || r.paymentStatus === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm email hoặc khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-1 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả TT</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="FAILED">Thất bại</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả CK</SelectItem>
              <SelectItem value="UNPAID">Chưa TT</SelectItem>
              <SelectItem value="PAID">Đã TT</SelectItem>
              <SelectItem value="VERIFIED">Xác nhận</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-xl font-bold text-slate-900">{requests.length}</p>
          <p className="text-xs text-slate-500">Tổng</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 text-center">
          <p className="text-xl font-bold text-amber-700">{requests.filter((r) => r.status === "PENDING").length}</p>
          <p className="text-xs text-slate-500">Chờ xử lý</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-xl font-bold text-blue-700">{requests.filter((r) => r.status === "PROCESSING").length}</p>
          <p className="text-xs text-slate-500">Đang xử lý</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 text-center">
          <p className="text-xl font-bold text-emerald-700">{requests.filter((r) => r.paymentStatus === "PAID" || r.paymentStatus === "VERIFIED").length}</p>
          <p className="text-xs text-slate-500">Đã thanh toán</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <p className="text-xl font-bold text-purple-700">
            {requests.reduce((sum, r) => sum + (r.paymentStatus !== "UNPAID" ? r.paymentAmount : 0), 0).toLocaleString("vi-VN")}₫
          </p>
          <p className="text-xs text-slate-500">Doanh thu</p>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[180px]">Email</TableHead>
              <TableHead className="w-[120px]">Password</TableHead>
              <TableHead className="w-[160px]">Khóa học</TableHead>
              <TableHead className="w-[120px]">Dịch vụ</TableHead>
              <TableHead className="w-[100px]">Thanh toán</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[160px]">Thời gian</TableHead>
              <TableHead className="w-[120px]">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                  {loading ? "Đang tải..." : "Chưa có yêu cầu nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((r) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.PENDING;
                const pt = PAYMENT_LABELS[r.paymentStatus] || PAYMENT_LABELS.UNPAID;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[180px] truncate text-sm font-medium">{r.email}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">
                          {visiblePasswords.has(r.id) ? r.password : "••••••"}
                        </span>
                        <button onClick={() => togglePassword(r.id)} className="text-slate-400 hover:text-slate-700">
                          {visiblePasswords.has(r.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal break-words text-sm">{r.courseTarget ?? "-"}</TableCell>
                    <TableCell className="text-xs">{SERVICE_LABELS[r.serviceType] || r.serviceType}</TableCell>
                    <TableCell>
                      <Select value={r.paymentStatus} onValueChange={(v) => updateField(r.id, "paymentStatus", v)}>
                        <SelectTrigger className={`h-7 w-full border text-xs ${pt.className}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNPAID">Chưa TT</SelectItem>
                          <SelectItem value="PAID">Đã TT</SelectItem>
                          <SelectItem value="VERIFIED">Xác nhận</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => updateField(r.id, "status", v)}>
                        <SelectTrigger className={`h-7 w-full border text-xs ${st.className}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                          <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                          <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                          <SelectItem value="FAILED">Thất bại</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(r)}
                      >
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <RequestDetailDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onSaved={(updated) => {
          setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          setSelectedRequest(updated);
        }}
      />
    </div>
  );
}
