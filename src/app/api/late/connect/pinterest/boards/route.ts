import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const tempToken = searchParams.get("tempToken");
    const connectToken = request.headers.get("X-Connect-Token");

    const { data, error } = await late.connect.pinterest.listPinterestBoardsForSelection({
      query: { tempToken: tempToken || "" },
      headers: { "X-Connect-Token": connectToken || "" },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to list Pinterest boards" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Pinterest boards error:", err);
    return NextResponse.json({ error: "Failed to list Pinterest boards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.connect.pinterest.selectPinterestBoard({
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to select Pinterest board" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Pinterest board select error:", err);
    return NextResponse.json({ error: "Failed to select Pinterest board" }, { status: 500 });
  }
}
