"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns/format";
import { parseISO } from "date-fns/parseISO";
import { toast } from "sonner";
import {
  useQueueSlots,
  useQueuePreview,
  useUpdateQueueSlots,
  useScheduledPosts,
  DAYS_OF_WEEK,
  type QueueSlot,
} from "@/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostListItem } from "@/components/posts";
import {
  Plus,
  Clock,
  Trash2,
  Loader2,
  Calendar,
  ListOrdered,
} from "lucide-react";

export default function QueuePage() {
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState<QueueSlot>({
    dayOfWeek: 1,
    hour: 9,
    minute: 0,
  });

  const { data: slotsData, isLoading: slotsLoading } = useQueueSlots();
  const { data: previewData, isLoading: previewLoading } = useQueuePreview(10);
  const { data: postsData, isLoading: postsLoading } = useScheduledPosts(10);
  const updateSlotsMutation = useUpdateQueueSlots();

  const slots = (slotsData?.schedule?.slots || []) as QueueSlot[];
  const upcomingSlots = (previewData?.slots || []) as string[];
  const queuedPosts = ((postsData?.posts || []) as any[]).filter(
    (p) => p.queuedFromProfile
  );

  // Group slots by day
  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, QueueSlot[]>);

  const handleAddSlot = async () => {
    try {
      await updateSlotsMutation.mutateAsync({
        slots: [...slots, newSlot],
      });
      toast.success("Queue slot added");
      setShowAddSlot(false);
    } catch {
      toast.error("Failed to add slot");
    }
  };

  const handleRemoveSlot = async (slotToRemove: QueueSlot) => {
    try {
      const newSlots = slots.filter(
        (s) =>
          !(
            s.dayOfWeek === slotToRemove.dayOfWeek &&
            s.hour === slotToRemove.hour &&
            s.minute === slotToRemove.minute
          )
      );
      await updateSlotsMutation.mutateAsync({ slots: newSlots });
      toast.success("Queue slot removed");
    } catch {
      toast.error("Failed to remove slot");
    }
  };

  const formatTime = (hour: number | undefined, minute: number | undefined) => {
    const h = hour ?? 0;
    const m = minute ?? 0;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Queue</h1>
        <p className="text-muted-foreground">
          Set up your posting schedule.
        </p>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Posting Times
            </CardTitle>
            <CardDescription>
              Configure when your queued posts should be published.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddSlot(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Slot
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {slotsLoading ? (
            <QueueScheduleSkeleton />
          ) : slots.length === 0 ? (
            <div className="rounded-lg bg-muted p-6 text-center">
              <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No posting times set up yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowAddSlot(true)}
              >
                Add Time Slot
              </Button>
            </div>
          ) : (
            DAYS_OF_WEEK.map((day, index) => {
              const daySlots = slotsByDay[index] || [];
              if (daySlots.length === 0) return null;

              return (
                <div key={day} className="flex items-start justify-between">
                  <span className="text-sm font-medium text-muted-foreground w-24">
                    {day}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-2">
                    {daySlots
                      .sort((a, b) => ((a.hour ?? 0) * 60 + (a.minute ?? 0)) - ((b.hour ?? 0) * 60 + (b.minute ?? 0)))
                      .map((slot, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {formatTime(slot.hour, slot.minute)}
                          <button
                            onClick={() => handleRemoveSlot(slot)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                            aria-label={`Remove ${formatTime(slot.hour, slot.minute)} slot`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Upcoming Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Next Up
          </CardTitle>
          <CardDescription>
            Your upcoming queue slots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {previewLoading ? (
            <UpcomingSlotsSkeleton />
          ) : upcomingSlots.length === 0 ? (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No upcoming slots. Add time slots to your schedule.
              </p>
            </div>
          ) : (
            upcomingSlots.slice(0, 5).map((slot, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-muted p-3"
              >
                <span className="text-sm">
                  {format(parseISO(slot), "EEEE, MMM d")}
                </span>
                <Badge variant="outline">
                  {format(parseISO(slot), "h:mm a")}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Queued Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListOrdered className="h-4 w-4" />
              Posts in Queue
            </CardTitle>
            <CardDescription>
              {queuedPosts.length} {queuedPosts.length === 1 ? "post" : "posts"} queued
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/compose">Add Post</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {postsLoading ? (
            <QueuedPostsSkeleton />
          ) : queuedPosts.length === 0 ? (
            <div className="rounded-lg bg-muted p-6 text-center">
              <ListOrdered className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No posts in queue. Create a post and add it to the queue.
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/compose">Create Post</Link>
              </Button>
            </div>
          ) : (
            queuedPosts.map((post: any, index: number) => (
              <div key={post._id} className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <PostListItem post={post} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Slot Dialog */}
      <Dialog open={showAddSlot} onOpenChange={setShowAddSlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Slot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={newSlot.dayOfWeek.toString()}
                onValueChange={(v) =>
                  setNewSlot({ ...newSlot, dayOfWeek: parseInt(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hour</Label>
                <Select
                  value={newSlot.hour.toString()}
                  onValueChange={(v) =>
                    setNewSlot({ ...newSlot, hour: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Minute</Label>
                <Select
                  value={newSlot.minute.toString()}
                  onValueChange={(v) =>
                    setNewSlot({ ...newSlot, minute: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 15, 30, 45].map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        :{m.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Preview: <span className="font-medium text-foreground">{formatTime(newSlot.hour, newSlot.minute)}</span> on <span className="font-medium text-foreground">{DAYS_OF_WEEK[newSlot.dayOfWeek]}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSlot(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSlot}
              disabled={updateSlotsMutation.isPending}
            >
              {updateSlotsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueScheduleSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingSlotsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="h-4 w-32 rounded bg-background" />
          <div className="h-6 w-16 rounded bg-background" />
        </div>
      ))}
    </div>
  );
}

function QueuedPostsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="h-8 w-8 rounded-full bg-background" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-background" />
            <div className="h-2 w-1/2 rounded bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}
