import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const late = getServerClient();
    const { data, error } = await late.posts.retryPost({
      path: { postId },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to retry post" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Post retry error:", err);
    return NextResponse.json({ error: "Failed to retry post" }, { status: 500 });
  }
}
