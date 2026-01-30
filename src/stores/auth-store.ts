import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UsageStats {
  planName: string;
  limits: {
    uploads: number;
    profiles: number;
  };
  usage: {
    uploads: number;
    profiles: number;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  usageStats: UsageStats | null;
  isValidating: boolean;
  error: string | null;
  hasHydrated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
  setUsageStats: (stats: UsageStats | null) => void;
  setIsValidating: (validating: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      usageStats: null,
      isValidating: false,
      error: null,
      hasHydrated: false,
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated, error: null }),
      setUsageStats: (stats) => set({ usageStats: stats }),
      setIsValidating: (validating) => set({ isValidating: validating }),
      setError: (error) => set({ error }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      logout: () =>
        set({
          isAuthenticated: false,
          usageStats: null,
          error: null,
        }),
    }),
    {
      name: "latewiz-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        usageStats: state.usageStats,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
