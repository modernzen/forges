import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const tempToken = searchParams.get("tempToken");
    const connectToken = request.headers.get("X-Connect-Token");

    const { data, error } = await late.connect.googleBusiness.listGoogleBusinessLocations({
      query: { tempToken: tempToken || "" },
      headers: { "X-Connect-Token": connectToken || "" },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to list Google Business locations" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Google Business locations error:", err);
    return NextResponse.json({ error: "Failed to list Google Business locations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.connect.googleBusiness.selectGoogleBusinessLocation({
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to select Google Business location" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Google Business location select error:", err);
    return NextResponse.json({ error: "Failed to select Google Business location" }, { status: 500 });
  }
}
