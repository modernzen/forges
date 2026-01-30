import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore, useAuthStore } from "@/stores";
import { useEffect } from "react";

export const profileKeys = {
  all: ["profiles"] as const,
  detail: (id: string) => ["profiles", id] as const,
};

export function useProfiles() {
  const { isAuthenticated } = useAuthStore();
  const { defaultProfileId, setDefaultProfileId } = useAppStore();

  const query = useQuery({
    queryKey: profileKeys.all,
    queryFn: async () => {
      const response = await fetch("/api/late/profiles");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch profiles");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (query.data?.profiles?.length && !defaultProfileId) {
      setDefaultProfileId(query.data.profiles[0]._id);
    }
  }, [query.data, defaultProfileId, setDefaultProfileId]);

  return query;
}

export function useCurrentProfileId(): string | undefined {
  const { defaultProfileId } = useAppStore();
  const { data } = useProfiles();
  return defaultProfileId || data?.profiles?.[0]?._id;
}

export function useProfile(profileId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: profileKeys.detail(profileId),
    queryFn: async () => {
      const response = await fetch(`/api/late/profiles/${profileId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch profile");
      }
      return response.json();
    },
    enabled: isAuthenticated && !!profileId,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/late/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      name,
      timezone,
    }: {
      profileId: string;
      name?: string;
      timezone?: string;
    }) => {
      const response = await fetch(`/api/late/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileId) });
    },
  });
}
