"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CourseraRequestRow, RequestStatus } from "@/components/RequestTable";

type RequestDetailDialogProps = {
  request: CourseraRequestRow | null;
  onClose: () => void;
  onSaved: (updated: CourseraRequestRow) => void;
};

const statusOptions: RequestStatus[] = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function RequestDetailDialog({ request, onClose, onSaved }: RequestDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<RequestStatus>("PENDING");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setAdminNotes(request.adminNotes || "");
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [request]);

  async function save() {
    if (!request) return;
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/admin/requests", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: request.id,
              status,
              adminNotes,
            }),
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || "Không thể lưu thay đổi");
          onSaved(payload.data);
          toast.success("Đã lưu chi tiết yêu cầu");
          onClose();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
        }
      })();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/30"
      onClose={onClose}
    >
      {request ? (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Chi tiết request</h3>
              <p className="text-sm text-slate-500">Cập nhật trạng thái và ghi chú quản trị.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 overflow-y-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                <Badge variant={status === "PENDING" ? "slate" : status === "PROCESSING" ? "blue" : status === "COMPLETED" ? "green" : "outline"} className="mt-2">
                  {request.status}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await copyText(request.email);
                  toast.success("Đã copy email");
                }}
              >
                <Copy className="h-4 w-4" />
                Copy email
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input readOnly value={request.email} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input readOnly value={request.password} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Course Target</Label>
                <Input readOnly value={request.courseTarget ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as RequestStatus)}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Ngày tạo</Label>
                <Input readOnly value={new Date(request.createdAt).toLocaleString("vi-VN")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Admin notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  placeholder="Ghi chú nội bộ cho yêu cầu này"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={save} disabled={isPending}>
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
