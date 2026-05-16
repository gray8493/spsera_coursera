import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { adminLoginSchema } from "@/lib/validation";
import { createAdminSessionCookie, signAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
    }

    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu đăng nhập không hợp lệ" }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const admin = await db.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
    }

    const token = signAdminSession({ adminId: admin.id, username: admin.username });
    const response = NextResponse.json({ success: true });
    response.cookies.set(createAdminSessionCookie(token));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
