const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const candidate = forwarded.split(",")[0] || realIp || "unknown";
  return candidate.trim() || "unknown";
}

export async function checkRateLimit(
  request: Request,
  key: string,
  limit = 20,
  windowMs = 60_000
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const bucketKey = `${key}:${getClientIp(request)}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: Math.max(0, bucket.resetAt - now) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
