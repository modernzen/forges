import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const connectToken = request.headers.get("X-Connect-Token");

    const { data, error } = await late.connect.facebook.listFacebookPages({
      headers: { "X-Connect-Token": connectToken || "" },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to list Facebook pages" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Facebook pages error:", err);
    return NextResponse.json({ error: "Failed to list Facebook pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.connect.facebook.selectFacebookPage({
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to select Facebook page" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Facebook page select error:", err);
    return NextResponse.json({ error: "Failed to select Facebook page" }, { status: 500 });
  }
}
