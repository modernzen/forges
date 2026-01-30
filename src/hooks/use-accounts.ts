import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentProfileId } from "./use-profiles";
import { useAuthStore } from "@/stores";
import type { Platform } from "@/lib/late-api";

export const accountKeys = {
  all: ["accounts"] as const,
  list: (profileId: string) => ["accounts", "list", profileId] as const,
  health: (profileId: string) => ["accounts", "health", profileId] as const,
  detail: (accountId: string) => ["accounts", "detail", accountId] as const,
};

export interface Account {
  _id: string;
  platform: Platform;
  username: string;
  displayName?: string;
  isActive: boolean;
  profilePicture?: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountHealth {
  accountId: string;
  isHealthy: boolean;
  error?: string;
}

export function useAccounts(profileId?: string) {
  const { isAuthenticated } = useAuthStore();
  const currentProfileId = useCurrentProfileId();
  const targetProfileId = profileId || currentProfileId;

  return useQuery({
    queryKey: accountKeys.list(targetProfileId || ""),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (targetProfileId) params.set("profileId", targetProfileId);

      const response = await fetch(`/api/late/accounts?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch accounts");
      }
      return response.json();
    },
    enabled: isAuthenticated && !!targetProfileId,
  });
}

export function useAccountsHealth(profileId?: string) {
  const { isAuthenticated } = useAuthStore();
  const currentProfileId = useCurrentProfileId();
  const targetProfileId = profileId || currentProfileId;

  return useQuery({
    queryKey: accountKeys.health(targetProfileId || ""),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (targetProfileId) params.set("profileId", targetProfileId);

      const response = await fetch(`/api/late/accounts/health?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch accounts health");
      }
      return response.json();
    },
    enabled: isAuthenticated && !!targetProfileId,
  });
}

export function useConnectAccount() {
  const currentProfileId = useCurrentProfileId();

  return useMutation({
    mutationFn: async ({
      platform,
      profileId,
    }: {
      platform: Platform;
      profileId?: string;
    }) => {
      const targetProfileId = profileId || currentProfileId;
      if (!targetProfileId) throw new Error("No profile selected");

      const redirectUrl = `${window.location.origin}/callback`;
      const params = new URLSearchParams({
        profileId: targetProfileId,
        redirect_url: redirectUrl,
      });

      const response = await fetch(`/api/late/connect/${platform}?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get connect URL");
      }
      return response.json();
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/late/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useAccountsByPlatform(profileId?: string) {
  const { data, ...rest } = useAccounts(profileId);

  const accountsByPlatform = data?.accounts?.reduce(
    (acc: Record<Platform, Account[]>, account: Account) => {
      const platform = account.platform as Platform;
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(account);
      return acc;
    },
    {} as Record<Platform, Account[]>
  );

  return { data: accountsByPlatform, accounts: data?.accounts, ...rest };
}
