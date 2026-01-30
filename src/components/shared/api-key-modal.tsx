"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, Zap, AlertCircle } from "lucide-react";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyModal({ open, onOpenChange }: ApiKeyModalProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuthenticated, setUsageStats } = useAuthStore();

  const handleGetStarted = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/check");
      const result = await response.json();

      if (!result.configured) {
        setError(result.error || "Service not configured. Please contact the administrator.");
        return;
      }

      setAuthenticated(true);
      setUsageStats(result.data);

      toast.success(`Connected to ${result.data.planName} plan`);
      onOpenChange(false);
      router.push("/dashboard");
    } catch (err) {
      console.error("Auth check error:", err);
      setError("Failed to connect. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Get Started with LateWiz
          </DialogTitle>
          <DialogDescription>
            Start scheduling posts across 13 social media platforms with a single interface.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Configuration Error</p>
                <p className="mt-1 text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <h4 className="font-medium mb-2">What you can do:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Schedule posts across 13 platforms</li>
              <li>- Use the visual calendar view</li>
              <li>- Set up smart posting queues</li>
              <li>- Upload images and videos</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleGetStarted} disabled={isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Get Started"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              asChild
            >
              <a
                href="https://docs.getlate.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
