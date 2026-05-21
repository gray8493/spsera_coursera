import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { escapeHtml } from "@/lib/sanitize";

export const runtime = "nodejs";

function buildSubject(courseTarget: string | null) {
  if (courseTarget) {
    return `[Spera] Chúc mừng bạn đã nhận được chứng chỉ ${courseTarget}`;
  }
  return "[Spera] Chúc mừng bạn đã nhận được chứng chỉ";
}

function buildHtml(params: {
  recipientName: string;
  courseTarget: string | null;
  serviceLabel: string;
}) {
  const { recipientName, courseTarget, serviceLabel } = params;
  const courseLine = courseTarget
    ? `<p style="margin:0 0 12px"><strong>Chứng chỉ / khóa học:</strong> ${escapeHtml(courseTarget)}</p>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.7;color:#0f172a;background:#f8fafc;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
        <p style="margin:0 0 12px;color:#475569">Xin chào ${escapeHtml(recipientName)},</p>
        <h2 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#0f172a">Chúc mừng bạn đã nhận được chứng chỉ</h2>
        <p style="margin:0 0 16px">Spera rất vui khi được đồng hành cùng bạn trong hành trình hoàn thành khóa học.</p>
        ${courseLine}
        <p style="margin:0 0 12px"><strong>Dịch vụ đã sử dụng:</strong> ${escapeHtml(serviceLabel)}</p>
        <p style="margin:0 0 16px">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi.</p>
        <div style="margin:24px 0;padding:16px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe">
          <p style="margin:0;font-weight:700;color:#1d4ed8">Spera đồng hành cùng bạn</p>
          <p style="margin:8px 0 0;color:#1e3a8a">Giảm ngay 10k cho nhóm bạn từ 2 người.</p>
        </div>
        <p style="margin:0;color:#64748b;font-size:14px">Nếu bạn cần hỗ trợ thêm, chỉ cần trả lời email này.</p>
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
    }

    const payload = body as { id?: unknown };
    const id = typeof payload.id === "string" ? payload.id : "";
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const request = await db.courseraRequest.findUnique({ where: { id } });
    if (!request) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu" }, { status: 404 });
    }

    const recipient = request.contactEmail || request.email;
    const serviceLabel = request.serviceType === "FULL_SUPPORT" ? "Hỗ trợ toàn diện (79K)" : "Skip Video & Reading (20K)";
    const subject = buildSubject(request.courseTarget ?? null);

    await resend.emails.send({
      from: "Spera <onboarding@resend.dev>",
      to: recipient,
      subject,
      html: buildHtml({
        recipientName: "bạn",
        courseTarget: request.courseTarget ?? null,
        serviceLabel,
      }),
    });

    return NextResponse.json({
      data: {
        id: request.id,
        recipient,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
