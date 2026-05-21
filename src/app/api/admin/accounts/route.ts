import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { adminCreateSchema } from "@/lib/validation";

export const runtime = "nodejs";

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

    const parsed = adminCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu tài khoản không hợp lệ" }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const existingAdmin = await db.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await db.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      data: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
