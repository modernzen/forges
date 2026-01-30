import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const { data, error } = await late.connect.getPendingOAuthData({
      query: { token: token! },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to get pending data" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Pending OAuth data error:", err);
    return NextResponse.json({ error: "Failed to get pending data" }, { status: 500 });
  }
}
