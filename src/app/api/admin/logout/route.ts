import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth";
import { getAppUrl } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", getAppUrl(request)));
  response.cookies.set(clearAdminSessionCookie());
  return response;
}
