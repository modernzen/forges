import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const queueId = searchParams.get("queueId");

    const { data, error } = await late.queue.getNextQueueSlot({
      query: {
        profileId: profileId!,
        queueId: queueId || undefined,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to get next slot" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Next queue slot error:", err);
    return NextResponse.json({ error: "Failed to get next slot" }, { status: 500 });
  }
}
