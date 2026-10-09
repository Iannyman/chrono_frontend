import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-cookie";
import { proxyUpstreamJson } from "@/lib/upstream";

const UPSTREAM_TIMEOUT = 10_000;

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/sessions/live`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      }
    );

    const data = await response.json();
    return proxyUpstreamJson(response, data);
  } catch {
    return NextResponse.json(
      { error: "Sessions service unavailable" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
