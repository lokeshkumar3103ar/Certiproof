import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Simple in-memory rate limiter for demo/hackathon purposes
// For production, use Upstash or Redis
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limiting for sensitive/expensive endpoints
  if (
    pathname === "/api/verify/extract" ||
    pathname.includes("/pdf")
  ) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = pathname === "/api/verify/extract" ? 5 : 10;

    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > windowMs) {
      rateData.count = 0;
      rateData.lastReset = now;
    }

    if (rateData.count >= limit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    rateData.count++;
    rateLimitMap.set(ip, rateData);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
