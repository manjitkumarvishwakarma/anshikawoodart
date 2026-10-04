import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // allow login endpoints
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(getAdminCookieName())?.value;

    if (!token) {
      // For API requests, return 401 JSON
      if (isAdminApi) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      // For pages, redirect
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    try {
      await verifyAdminToken(token);
      return NextResponse.next();
    } catch {
      if (isAdminApi) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};