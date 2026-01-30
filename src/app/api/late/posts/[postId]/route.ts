import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const late = getServerClient();
    const { data, error } = await late.posts.getPost({
      path: { postId },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch post" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Post fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.posts.updatePost({
      path: { postId },
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to update post" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Post update error:", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const late = getServerClient();
    const { error } = await late.posts.deletePost({
      path: { postId },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to delete post" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Post delete error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
