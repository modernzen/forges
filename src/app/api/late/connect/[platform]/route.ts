import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";
import type { Platform } from "@/lib/late-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const redirectUrl = searchParams.get("redirect_url");

    const { data, error } = await late.connect.getConnectUrl({
      path: { platform: platform as Platform },
      query: {
        profileId: profileId || undefined,
        redirect_url: redirectUrl || undefined,
        headless: true,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to get connect URL" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Connect URL error:", err);
    return NextResponse.json({ error: "Failed to get connect URL" }, { status: 500 });
  }
}
