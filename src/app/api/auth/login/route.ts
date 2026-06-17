import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setAuthCookie, toSafeUser, AuthError } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      throw new AuthError("Email and password required", 400);
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid credentials", 400);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      throw new AuthError("Invalid credentials", 400);
    }

    const token = await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      message: "Login successful",
      user: toSafeUser(user),
      token,
    });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ message }, { status });
  }
}
