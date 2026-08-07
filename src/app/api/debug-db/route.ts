import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return NextResponse.json({ error: "DATABASE_URL not found" });
  }

  const parsed = new URL(url);

  return NextResponse.json({
    host: parsed.host,
    database: parsed.pathname,
  });
}