import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET() {
  try {
    const late = getServerClient();
    const { data, error } = await late.profiles.listProfiles();

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch profiles" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Profiles fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.profiles.createProfile({
      body: { name: body.name },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to create profile" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Profile create error:", err);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
