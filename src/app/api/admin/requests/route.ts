import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { statusSchema, paymentStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await db.courseraRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: requests.map((request) => ({
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    })),
  });
}

export async function PATCH(req: Request) {
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

    const payload = body as { id?: unknown; status?: unknown; paymentStatus?: unknown; adminNotes?: unknown };
    const id = typeof payload.id === "string" ? payload.id : "";
    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    const parsedStatus = statusSchema.safeParse(payload.status);
    if (parsedStatus.success) {
      updateData.status = parsedStatus.data;
    }

    const parsedPaymentStatus = paymentStatusSchema.safeParse(payload.paymentStatus);
    if (parsedPaymentStatus.success) {
      updateData.paymentStatus = parsedPaymentStatus.data;
    }

    if (typeof payload.adminNotes === "string") {
      const notes = payload.adminNotes.trim();
      updateData.adminNotes = notes.length > 0 ? notes : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Không có dữ liệu cập nhật" }, { status: 400 });
    }

    const updated = await db.courseraRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    await db.courseraRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
