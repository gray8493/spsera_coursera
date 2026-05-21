"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAdminAccountDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, startSaveTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      setUsername("");
      setPassword("");
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleSubmit() {
    startSaveTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/admin/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error || "Không thể tạo tài khoản");
          }
          toast.success(`Đã tạo tài khoản ${payload.data.username}`);
          closeDialog();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
        }
      })();
    });
  }

  return (
    <>
      <Button type="button" onClick={openDialog}>
        <UserPlus className="h-4 w-4" />
        Thêm tài khoản
      </Button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/30"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Thêm tài khoản admin</h3>
            <p className="text-sm text-slate-500">Tạo tài khoản mới để đăng nhập dashboard.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={closeDialog} aria-label="Đóng">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nhập username"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button variant="outline" onClick={closeDialog}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || username.trim() === "" || password.trim().length < 6}>
            Tạo tài khoản
          </Button>
        </div>
      </dialog>
    </>
  );
}
