import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, AuthError } from "@/lib/auth";

/**
 * GET /api/user/logs/weekly
 * Returns the last 7 days of daily logs for the current user.
 * Mirrors the original Express `GET /api/user/logs/weekly` route.
 */
export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      throw new AuthError("Not authenticated", 401);
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todayStr = today.toISOString().split("T")[0];
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const logs = await db.dailyLog.findMany({
      where: {
        userId: user.id,
        date: { gte: weekAgoStr, lte: todayStr },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(logs);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ message }, { status });
  }
}
