import { NextResponse } from "next/server";
import { AUTH_COOKIE, USER_COOKIE } from "./auth-cookie";

// Wraps an upstream (chrono_backend) response. On 401 the session cookie is
// provably dead, so drop both cookies — proxy.ts then sends the next full
// navigation to /login instead of the client polling a ghost session.
export function proxyUpstreamJson(
  upstream: Response,
  data: unknown
): NextResponse {
  const res = NextResponse.json(data, { status: upstream.status });
  if (upstream.status === 401) {
    res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}
