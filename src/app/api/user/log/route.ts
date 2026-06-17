import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, AuthError } from "@/lib/auth";

/**
 * POST /api/user/log
 * Upserts a daily log entry for the current user + date.
 * Mirrors the original Express `POST /api/user/log` route.
 */
export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      throw new AuthError("Not authenticated", 401);
    }

    const body = await request.json().catch(() => ({}));
    const today =
      String(body?.date ?? "") ||
      new Date().toISOString().split("T")[0];

    const log = await db.dailyLog.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {
        calories: Number(body?.calories ?? 0),
        protein: Number(body?.protein ?? 0),
        carbs: Number(body?.carbs ?? 0),
        fat: Number(body?.fat ?? 0),
        steps: Number(body?.steps ?? 0),
        water: Number(body?.water ?? 0),
        sleep: Number(body?.sleep ?? 0),
        exercises: (body?.exercises ?? []) as object,
      },
      create: {
        userId: user.id,
        date: today,
        calories: Number(body?.calories ?? 0),
        protein: Number(body?.protein ?? 0),
        carbs: Number(body?.carbs ?? 0),
        fat: Number(body?.fat ?? 0),
        steps: Number(body?.steps ?? 0),
        water: Number(body?.water ?? 0),
        sleep: Number(body?.sleep ?? 0),
        exercises: (body?.exercises ?? []) as object,
      },
    });

    return NextResponse.json({ message: "Log saved", log });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ message }, { status });
  }
}
