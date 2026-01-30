"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore, useAppStore } from "@/stores";
import { getTimezoneOptions } from "@/lib/timezones";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Key, Moon, Sun, Globe, Trash2, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { usageStats, logout } = useAuthStore();
  const { timezone, setTimezone } = useAppStore();

  const timezoneOptions = useMemo(
    () => getTimezoneOptions(timezone),
    [timezone]
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Account
          </CardTitle>
          <CardDescription>
            View your Late account details and manage your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageStats && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{usageStats.planName}</span>
                <Button variant="link" size="sm" className="h-auto p-0" asChild>
                  <a
                    href="https://getlate.dev/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Manage Plan
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
              <div className="mt-2 grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploads</span>
                  <span>
                    {usageStats.limits.uploads < 0 ? (
                      <>{usageStats.usage.uploads.toLocaleString()} / Unlimited</>
                    ) : (
                      <>{usageStats.usage.uploads.toLocaleString()} / {usageStats.limits.uploads.toLocaleString()}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profiles</span>
                  <span>
                    {usageStats.limits.profiles < 0 ? (
                      <>{usageStats.usage.profiles.toLocaleString()} / Unlimited</>
                    ) : (
                      <>{usageStats.usage.profiles.toLocaleString()} / {usageStats.limits.profiles.toLocaleString()}</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button variant="outline" asChild>
            <a
              href="https://getlate.dev/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Late Dashboard
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how LateWiz looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Timezone
          </CardTitle>
          <CardDescription>
            Set your default timezone for scheduling posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Default Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Sign Out</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign Out</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out of LateWiz. You can sign back in at any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>LateWiz - Your social media scheduling wizard</p>
            <p className="mt-1">
              Powered by{" "}
              <a
                href="https://getlate.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Late
              </a>
            </p>
            <p className="mt-2">
              <a
                href="https://github.com/getlate-dev/latewiz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                View on GitHub
              </a>
              {" . "}
              <a
                href="https://github.com/getlate-dev/latewiz/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Report Issue
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
