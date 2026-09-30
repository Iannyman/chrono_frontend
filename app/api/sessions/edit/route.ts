// export async function PUT(request: Request) {

//     const body = await request.json();


//     console.log("Received session:", body);

//     const response = await fetch("/api/sessions/edit", {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//         throw new Error("Backend failed to update sassion")
//     }
//     const data = await response.json();

//     return Response.json({data, 
//         message: "Session received",
//     });
// }

import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_TIMEOUT = 10_000;

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
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
      `${process.env.API_BASE_URL}/sessions/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "Sessions service unavailable" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
