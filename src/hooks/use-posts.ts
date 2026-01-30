import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentProfileId } from "./use-profiles";
import { useAuthStore } from "@/stores";
import type { Platform, PlatformSpecificData } from "@/lib/late-api";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => ["posts", "list"] as const,
  list: (filters: PostFilters) => ["posts", "list", filters] as const,
  detail: (postId: string) => ["posts", "detail", postId] as const,
};

export interface PostFilters {
  profileId?: string;
  status?: "draft" | "scheduled" | "publishing" | "published" | "failed";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface MediaItem {
  type: "image" | "video";
  url: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface PlatformPost {
  platform: Platform;
  accountId: string;
  customContent?: string;
  platformSpecificData?: PlatformSpecificData;
}

export interface CreatePostInput {
  content: string;
  mediaItems?: MediaItem[];
  platforms: PlatformPost[];
  scheduledFor?: string;
  publishNow?: boolean;
  timezone?: string;
  queuedFromProfile?: string;
}

export interface UpdatePostInput {
  postId: string;
  content?: string;
  mediaItems?: MediaItem[];
  platforms?: PlatformPost[];
  scheduledFor?: string;
}

export function usePosts(filters: PostFilters = {}) {
  const { isAuthenticated } = useAuthStore();
  const currentProfileId = useCurrentProfileId();
  const profileId = filters.profileId || currentProfileId;

  return useQuery({
    queryKey: postKeys.list({ ...filters, profileId }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (profileId) params.set("profileId", profileId);
      if (filters.status) params.set("status", filters.status);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.page) params.set("page", String(filters.page));
      params.set("limit", String(filters.limit || 50));

      const response = await fetch(`/api/late/posts?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch posts");
      }
      return response.json();
    },
    enabled: isAuthenticated && !!profileId,
  });
}

export function usePost(postId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      const response = await fetch(`/api/late/posts/${postId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch post");
      }
      return response.json();
    },
    enabled: isAuthenticated && !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const response = await fetch("/api/late/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, ...input }: UpdatePostInput) => {
      const response = await fetch(`/api/late/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }
      return response.json();
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/late/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete post");
      }
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useRetryPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/late/posts/${postId}/retry`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to retry post");
      }
      return response.json();
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useCalendarPosts(dateFrom: string, dateTo: string) {
  return usePosts({
    dateFrom,
    dateTo,
    limit: 500,
  });
}

export function useScheduledPosts(limit = 10) {
  return usePosts({
    status: "scheduled",
    limit,
  });
}

export function useRecentPosts(limit = 10) {
  return usePosts({
    status: "published",
    limit,
  });
}
