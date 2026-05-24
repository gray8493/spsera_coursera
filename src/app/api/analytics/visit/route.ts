import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const payload = body as { path?: unknown; referrer?: unknown };
    const path = typeof payload.path === "string" && payload.path.trim().length > 0 ? payload.path.trim() : "/";
    const referrer = typeof payload.referrer === "string" && payload.referrer.trim().length > 0 ? payload.referrer.trim() : null;

    await db.visitEvent.create({
      data: {
        path,
        referrer,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
