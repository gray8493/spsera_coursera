import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend } from "@/lib/resend";
import { escapeHtml } from "@/lib/sanitize";
import { requestSchema } from "@/lib/validation";
import { PRICING } from "@/lib/payment";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", issues: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const paymentAmount = PRICING[data.serviceType];

    const newRequest = await db.courseraRequest.create({
      data: {
        email: data.email,
        password: data.password,
        courseTarget: data.courseTarget ?? null,
        fptCode: data.fptCode ?? null,
        serviceType: data.serviceType,
        paymentAmount,
        paymentStatus: "UNPAID",
      },
    });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_ALERT_EMAIL;
    if (adminEmail) {
      const adminDashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/dashboard`;
      const serviceLabel = data.serviceType === "FULL_SUPPORT" ? "Hỗ trợ toàn diện (79K)" : "Skip Video & Reading (20K)";

      try {
        await resend.emails.send({
          from: "Coursera Platform <onboarding@resend.dev>",
          to: adminEmail,
          subject: `[Coursera Tool] Yêu cầu hỗ trợ mới từ ${data.email}`,
          html: `
            <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
              <h2 style="margin:0 0 16px">Có yêu cầu hỗ trợ mới được tạo</h2>
              <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
              <p><strong>Password:</strong> ${escapeHtml(data.password)}</p>
              <p><strong>Course Target:</strong> ${escapeHtml(data.courseTarget ?? "")}</p>
              ${data.fptCode ? `<p><strong>Mã môn FPT:</strong> ${escapeHtml(data.fptCode)}</p>` : ""}
              <p><strong>Dịch vụ:</strong> ${serviceLabel}</p>
              <p><strong>Số tiền:</strong> ${paymentAmount.toLocaleString("vi-VN")}₫</p>
              <p><strong>Trạng thái TT:</strong> Chưa thanh toán</p>
              <p><strong>Thời gian:</strong> ${escapeHtml(newRequest.createdAt.toLocaleString("vi-VN"))}</p>
              <p style="margin-top:24px">
                <a href="${escapeHtml(adminDashboardUrl)}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Truy cập Dashboard</a>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email send failed:", emailError);
      }
    }

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
