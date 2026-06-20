import { db, type LocalUser } from "../db";

/**
 * User repository — reads/writes the local user profile (Dexie).
 * The single row has id="local-user".
 */

const USER_ID = "local-user";

export async function getUser(): Promise<LocalUser | undefined> {
  const d = db();
  if (!d) return undefined;
  return d.users.get(USER_ID);
}

export async function saveUser(
  data: Omit<LocalUser, "id" | "updatedAt"> & Partial<Pick<LocalUser, "updatedAt">>
): Promise<LocalUser> {
  const d = db();
  if (!d) throw new Error("Database unavailable");
  const now = Date.now();
  const user: LocalUser = {
    id: USER_ID,
    updatedAt: data.updatedAt ?? now,
    ...data,
  };
  await d.users.put(user);
  return user;
}

export async function patchUser(
  patch: Partial<Omit<LocalUser, "id">>
): Promise<LocalUser | undefined> {
  const d = db();
  if (!d) throw new Error("Database unavailable");
  const existing = await d.users.get(USER_ID);
  if (!existing) return undefined;
  const updated: LocalUser = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  await d.users.put(updated);
  return updated;
}

export async function clearUser(): Promise<void> {
  const d = db();
  if (!d) return;
  await d.users.delete(USER_ID);
}
