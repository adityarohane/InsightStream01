import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_INNGEST_SERVER_URL || "https://api.inngest.com";
    const response = await fetch(`${baseUrl}/v1/events/${eventId}/runs`, {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_EVENT_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data.data ?? data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
