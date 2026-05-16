import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    const existingAdmin = await db.admin.findUnique({
      where: { username: "admin" }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin account already exists." });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await db.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Tài khoản admin đã được tạo thành công!",
      credentials: {
        username: "admin",
        password: "admin123"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
