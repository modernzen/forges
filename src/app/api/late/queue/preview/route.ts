import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const count = searchParams.get("count");

    const { data, error } = await late.queue.previewQueue({
      query: {
        profileId: profileId!,
        count: count ? parseInt(count) : 10,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to preview queue" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Queue preview error:", err);
    return NextResponse.json({ error: "Failed to preview queue" }, { status: 500 });
  }
}
