import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET() {
  try {
    if (!process.env.LATE_API_KEY) {
      return NextResponse.json(
        {
          configured: false,
          error: "Late API key not configured. Please set LATE_API_KEY environment variable."
        },
        { status: 503 }
      );
    }

    const late = getServerClient();
    const { data, error } = await late.usage.getUsageStats();

    if (error || !data) {
      return NextResponse.json(
        {
          configured: false,
          error: "Invalid Late API key configuration."
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      configured: true,
      data
    });
  } catch (err) {
    console.error("Auth check error:", err);
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to verify configuration."
      },
      { status: 500 }
    );
  }
}
