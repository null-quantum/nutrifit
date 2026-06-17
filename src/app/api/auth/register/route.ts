import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setAuthCookie, toSafeUser, AuthError } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!name || !email || !password) {
      throw new AuthError("All fields are required", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AuthError("Please enter a valid email address.", 400);
    }
    if (password.length < 6) {
      throw new AuthError("Password must be at least 6 characters.", 400);
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      throw new AuthError("Email already registered", 400);
    }

    const hashed = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, password: hashed },
    });

    const token = await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json(
      { message: "Registration successful", user: toSafeUser(user), token },
      { status: 201 }
    );
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ message }, { status });
  }
}
