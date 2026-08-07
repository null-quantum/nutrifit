const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

export const env = {
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL ?? (isProduction ? "" : "file:./dev.db"),
  databaseProvider: process.env.DATABASE_PROVIDER ?? "sqlite",
  jwtSecret: process.env.JWT_SECRET ?? (isProduction ? "" : "dev-jwt-secret-change-me"),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export function assertServerEnv() {
  if (isProduction && !env.databaseUrl) {
    throw new Error("DATABASE_URL is required in production.");
  }

  if (isProduction && !env.jwtSecret) {
    throw new Error("JWT_SECRET is required in production.");
  }
}
