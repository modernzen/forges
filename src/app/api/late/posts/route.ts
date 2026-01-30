import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);

    const { data, error } = await late.posts.listPosts({
      query: {
        profileId: searchParams.get("profileId") || undefined,
        status: (searchParams.get("status") as "draft" | "scheduled" | "publishing" | "published" | "failed") || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
        page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
        limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch posts" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Posts fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.posts.createPost({
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Post create error:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
