import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "medical_auth_session";

const secret = process.env.AUTH_SECRET;
const secretKey = new TextEncoder().encode(secret);

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isDoctorRoute = pathname.startsWith("/doctor");
  const isCompounderRoute = pathname.startsWith("/compounder");

  const isProtectedRoute = isDoctorRoute || isCompounderRoute;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifyToken(token);

  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete(AUTH_COOKIE);

    return response;
  }

  if (isDoctorRoute && session.role !== "doctor") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isCompounderRoute && session.role !== "compounder") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/doctor/:path*", "/compounder/:path*"],
};
