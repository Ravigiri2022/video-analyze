import { NextResponse } from "next/server";

// Email reporting is not yet configured.
// Returns 501 so callers fail gracefully without crashing the build.
export async function POST() {
  return NextResponse.json({ error: "Email reporting not configured" }, { status: 501 });
}
