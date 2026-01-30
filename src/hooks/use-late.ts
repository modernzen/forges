import { useAuthStore } from "@/stores";

export function useLate() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? {} : null;
}

export function useLateClient() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    throw new Error("Not authenticated. Please sign in to continue.");
  }
  return {};
}
