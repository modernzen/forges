import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function GET(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const queueId = searchParams.get("queueId");
    const all = searchParams.get("all");

    const { data, error } = await late.queue.listQueueSlots({
      query: {
        profileId: profileId!,
        queueId: queueId || undefined,
        all: all || undefined,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to fetch queue" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Queue fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.queue.createQueueSlot({
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to create queue" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Queue create error:", err);
    return NextResponse.json({ error: "Failed to create queue" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const late = getServerClient();
    const body = await request.json();

    const { data, error } = await late.queue.updateQueueSlot({
      body,
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to update queue" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Queue update error:", err);
    return NextResponse.json({ error: "Failed to update queue" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const late = getServerClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const queueId = searchParams.get("queueId");

    const { data, error } = await late.queue.deleteQueueSlot({
      query: { profileId: profileId!, queueId: queueId! },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to delete queue" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Queue delete error:", err);
    return NextResponse.json({ error: "Failed to delete queue" }, { status: 500 });
  }
}
