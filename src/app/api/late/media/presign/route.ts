import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.media.getMediaPresignedUrl({
      body: { filename: body.filename, contentType: body.contentType },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to get presigned URL" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Media presign error:", err);
    return NextResponse.json({ error: "Failed to get presigned URL" }, { status: 500 });
  }
}
