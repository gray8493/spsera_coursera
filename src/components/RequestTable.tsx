"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
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
import { RefreshCw, Eye, EyeOff, Search, Filter, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequestDetailDialog } from "@/components/RequestDetailDialog";

export type RequestStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type CourseraRequestRow = {
  id: string;
  email: string;
  contactEmail: string | null;
  password: string;
  courseTarget: string | null;
  fptCode: string | null;
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
  const [isDeleting, startDeleteTransition] = useTransition();

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

  const deleteRequest = (request: CourseraRequestRow) => {
    const confirmed = window.confirm(`Xóa record của ${request.email}? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    startDeleteTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/admin/requests", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: request.id }),
          });
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.error || "Không thể xóa record");
          setRequests((prev) => prev.filter((item) => item.id !== request.id));
          if (selectedRequest?.id === request.id) {
            setSelectedRequest(null);
          }
          toast.success("Đã xóa record");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
        }
      })();
    });
  };

  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      searchTerm === "" ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.contactEmail ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              <TableHead className="w-[72px]">#</TableHead>
              <TableHead className="w-[180px]">Email</TableHead>
              <TableHead className="w-[120px]">Password</TableHead>
              <TableHead className="w-[160px]">Khóa học</TableHead>
              <TableHead className="w-[180px]">Email liên hệ</TableHead>
              <TableHead className="w-[140px]">Mã môn FPT</TableHead>
              <TableHead className="w-[120px]">Dịch vụ</TableHead>
              <TableHead className="w-[110px]">Thanh toán</TableHead>
              <TableHead className="w-[150px]">Trạng thái</TableHead>
              <TableHead className="w-[160px]">Thời gian</TableHead>
              <TableHead className="sticky right-0 z-10 w-[220px] bg-slate-50">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center text-slate-500">
                  {loading ? "Đang tải..." : "Chưa có yêu cầu nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((r, index) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.PENDING;
                const pt = PAYMENT_LABELS[r.paymentStatus] || PAYMENT_LABELS.UNPAID;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs font-medium text-slate-500">{index + 1}</TableCell>
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
                    <TableCell className="max-w-[180px] whitespace-normal break-words text-sm">{r.contactEmail ?? "-"}</TableCell>
                    <TableCell className="max-w-[140px] whitespace-normal break-words text-sm">{r.fptCode ?? "-"}</TableCell>
                    <TableCell className="text-xs">{SERVICE_LABELS[r.serviceType] || r.serviceType}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <select
                        value={r.paymentStatus}
                        onChange={(event) => updateField(r.id, "paymentStatus", event.target.value)}
                        className={`h-7 w-[110px] rounded-md border px-2 text-xs outline-none transition focus:ring-2 focus:ring-ring ${pt.className}`}
                      >
                        <option value="UNPAID">Chưa TT</option>
                        <option value="PAID">Đã TT</option>
                        <option value="VERIFIED">Xác nhận</option>
                      </select>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <select
                        value={r.status}
                        onChange={(event) => updateField(r.id, "status", event.target.value)}
                        className={`h-7 w-[140px] rounded-md border px-2 text-xs outline-none transition focus:ring-2 focus:ring-ring ${st.className}`}
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="PROCESSING">Đang xử lý</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="FAILED">Thất bại</option>
                      </select>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-white shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 justify-center whitespace-nowrap"
                          aria-label={`Xem chi tiết yêu cầu của ${r.email}`}
                          onClick={() => setSelectedRequest(r)}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="flex-1 justify-center whitespace-nowrap"
                          aria-label={`Xóa record của ${r.email}`}
                          onClick={() => deleteRequest(r)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
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
