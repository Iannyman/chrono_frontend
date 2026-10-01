export async function DELETE(request: Request, log_id: number) {

    const body = await request.json();
    const logId = body.log_id


    console.log("Deleted session:", log_id);

    const response = await fetch("/api/sessions/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            log_id: logId,
        }),
    });

    if (!response.ok) {
        throw new Error("Backend failed to delete sassion")
    }
    const data = await response.json();

    return Response.json({
        data,
        message: "Session deleted",
    });
}