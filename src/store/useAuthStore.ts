"use client";

import { create } from "zustand";
import { api, setToken, syncPendingLogs, isOnline } from "@/lib/api";
import type { SafeUser } from "@/lib/types";
import { localGet, localDel, KEYS } from "@/lib/localDb";

export type AppView = "landing" | "auth" | "onboarding" | "dashboard";

type AuthState = {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  view: AppView;
  hasChecked: boolean;
  /** True when the session is being served from local storage (offline). */
  offlineMode: boolean;

  setView: (view: AppView) => void;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<SafeUser>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<SafeUser>;
  logout: () => Promise<void>;
  completeOnboarding: (payload: {
    age: number;
    gender?: string;
    sex?: string;
    height: number;
    weight: number;
    stepGoal: number;
    exerciseType: string;
    dietPreference: string;
  }) => Promise<SafeUser>;
  updateProfile: (payload: {
    name?: string;
    age?: number;
    sex?: string;
    height?: number;
    weight?: number;
    stepGoal?: number;
    exerciseType?: string;
    dietPreference?: string;
  }) => Promise<SafeUser>;
  resolveView: () => AppView;
};

function viewForUser(user: SafeUser | null): AppView {
  if (!user) return "landing";
  return user.onboardingDone ? "dashboard" : "onboarding";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  view: "landing",
  hasChecked: false,
  offlineMode: false,

  setView: (view) => set({ view }),

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      // api.profile() is online-first with a local fallback.
      const user = await api.profile();
      const wasOffline = !isOnline();
      set({
        user,
        isAuthenticated: true,
        view: viewForUser(user),
        isCheckingAuth: false,
        hasChecked: true,
        offlineMode: wasOffline,
      });
      // If we came online, push any queued logs.
      if (!wasOffline) void syncPendingLogs();
    } catch {
      setToken(null);
      set({
        user: null,
        isAuthenticated: false,
        view: "landing",
        isCheckingAuth: false,
        hasChecked: true,
        offlineMode: false,
      });
    }
  },

  login: async (email, password) => {
    const { user } = await api.login(email, password);
    set({
      user,
      isAuthenticated: true,
      view: viewForUser(user),
      offlineMode: false,
    });
    return user;
  },

  register: async (name, email, password) => {
    const { user } = await api.register(name, email, password);
    set({
      user,
      isAuthenticated: true,
      view: viewForUser(user),
      offlineMode: false,
    });
    return user;
  },

  logout: async () => {
    await api.logout();
    await localDel(KEYS.user);
    set({
      user: null,
      isAuthenticated: false,
      view: "landing",
      offlineMode: false,
    });
  },

  completeOnboarding: async (payload) => {
    const { user } = await api.onboarding(payload);
    set({ user, isAuthenticated: true, view: "dashboard" });
    return user;
  },

  updateProfile: async (payload) => {
    const user = await api.updateProfile(payload);
    set({ user });
    return user;
  },

  resolveView: () => viewForUser(get().user),
}));
