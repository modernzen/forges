import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    const { data, error } = await late.accounts.getAllAccountsHealth({
      query: { profileId: profileId || undefined },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch accounts health" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Accounts health fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch accounts health" }, { status: 500 });
  }
}
