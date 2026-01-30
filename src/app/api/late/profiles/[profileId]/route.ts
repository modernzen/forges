import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;
    const late = getServerClient();
    const { data, error } = await late.profiles.getProfile({
      path: { profileId },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await params;
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.profiles.updateProfile({
      path: { profileId },
      body: { name: body.name, timezone: body.timezone },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
