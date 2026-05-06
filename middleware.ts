import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/app", "/library", "/profile"];

export async function middleware(req: NextRequest) {
  const { supabase, res } = createSupabaseMiddlewareClient(req);
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (!isProtected) return res;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(`[Middleware] Path: ${pathname}, User: ${user ? user.email : "none"}`);

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Run on all routes except:
     * - static files
     * - Next.js internals
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

