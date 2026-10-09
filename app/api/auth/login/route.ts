import { NextResponse } from "next/server";
import { AUTH_COOKIE, USER_COOKIE } from "@/lib/auth-cookie";

const UPSTREAM_TIMEOUT = 10_000;

export async function POST(request: Request) {
  let username: string, password: string;
  try {
    const body = await request.json();
    username = body.username;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  let response: Response;
  try {
    response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
  } catch {
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return NextResponse.json(
      { status: response.status },
      { status: response.status }
    );
  }

  const data: AuthResponse = await response.json();

  const maxAge = (() => {
    const match = String(data.expiresIn).match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
      return value * units[match[2]];
    }
    const n = Number(data.expiresIn);
    return Number.isFinite(n) && n > 0 ? n : 3600;
  })();

  const res = NextResponse.json({ user: data.user });

  // Secure cookies are rejected by browsers over plain HTTP on non-localhost
  // hosts (e.g. the container IP), which silently drops the auth token. Gate
  // on the request scheme so HTTP works on the LAN and HTTPS stays secure.
  const secure = request.url.startsWith("https://");

  res.cookies.set(AUTH_COOKIE, data.token, {
    path: "/",
    maxAge,
    sameSite: "lax",
    httpOnly: true,
    secure,
  });

  res.cookies.set(USER_COOKIE, JSON.stringify(data.user), {
    path: "/",
    maxAge,
    sameSite: "lax",
    httpOnly: true,
    secure,
  });

  return res;
}
