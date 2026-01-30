import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.connect.linkedin.selectLinkedInOrganization({
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to select LinkedIn organization" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("LinkedIn organization select error:", err);
    return NextResponse.json({ error: "Failed to select LinkedIn organization" }, { status: 500 });
  }
}
