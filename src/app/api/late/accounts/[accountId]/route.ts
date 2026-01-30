import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/late-api/client";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const late = getServerClient();
    const { error } = await late.accounts.deleteAccount({
      path: { accountId },
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to delete account" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account delete error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
