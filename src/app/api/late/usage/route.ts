import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET() {
  try {
    const late = getServerClient();
    const { data, error } = await late.usage.getUsageStats();

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch usage" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Usage fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
