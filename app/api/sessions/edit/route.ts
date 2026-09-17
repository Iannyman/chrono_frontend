export async function PUT(request: Request) {

    const body = await request.json();


    console.log("Received session:", body);

    const response = await fetch("/api/sessions/edit", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error("Backend failed to update sassion")
    }
    const data = await response.json();

    return Response.json({data, 
        message: "Session received",
    });
}