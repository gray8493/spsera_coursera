import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
    }

    const { id } = body as { id?: string };
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Thiếu request ID" }, { status: 400 });
    }

    const updated = await db.courseraRequest.update({
      where: { id },
      data: { paymentStatus: "PAID" },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
