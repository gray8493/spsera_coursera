import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  response.cookies.set(clearAdminSessionCookie());
  return response;
}
