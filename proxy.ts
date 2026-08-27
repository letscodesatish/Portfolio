import { NextResponse } from "next/server";

// Hard production block for the CMS admin surface, ahead of any page or
// Server Action logic. This is intentionally unconditional — no secret or
// header can override it — so the guarantee "zero public write access in
// production" holds even if app/admin/layout.tsx or a Server Action ever
// regresses its own check.
//
// Note: Server Actions are POST requests to the page they're defined on, not
// separate routes, so this matcher covers their Server Actions too. Every
// action in app/admin/actions.ts still calls assertLocalAdmin() itself
// regardless — per Next.js's own guidance, proxy/middleware alone is not a
// substitute for checking authorization inside the action.
export function proxy() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
