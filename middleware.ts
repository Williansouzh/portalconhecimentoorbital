import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, canCurate, readSessionToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith("/api");
  const session = await readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    // Quem já tem sessão não precisa ver o login de novo.
    if (pathname === "/login" && session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (isApi) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const login = new URL("/login", req.url);
    if (pathname !== "/") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  // Área de curadoria: só autor e curador.
  if (pathname.startsWith("/admin") && !canCurate(session.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Tudo, menos assets estáticos e o favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|riocard.jpeg).*)"],
};
