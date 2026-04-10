"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Repeat2, Circle, CircleCheckBig, X,
  ChefHat, Droplets, Bed, Sofa, Monitor, Trees, Car, PawPrint,
  type LucideIcon,
} from "lucide-react";
import { SettingsSheet } from "@/components/settings-sheet";
import { FeedbackSheet } from "@/components/feedback-sheet";
import { ProgressField } from "@/components/ui/progress-field";
import { StarCountBadge } from "@/components/star-count-badge";

type Loop = {
  id: string;
  category: string;
  tasks: string[];
  how_long: string | null;
  how_often: string | null;
  days: string[] | null;
  task_state: boolean[] | null;
};

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Kitchen: ChefHat,
  Bathroom: Droplets,
  Bedroom: Bed,
  "Living Room": Sofa,
  Office: Monitor,
  Outside: Trees,
  Car: Car,
  Pet: PawPrint,
};

export default function YourLoopsPage() {
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const [openLoops, setOpenLoops] = useState<Loop[] | null>(null);
  const [taskStates, setTaskStates] = useState<Record<string, boolean[]>>({});
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
      return;
    }
    const supabase = createClient();

    supabase
      .from("loops")
      .select("id, category, tasks, how_long, how_often, days, task_state")
      .eq("user_id", userProfile.id)
      .eq("completed", false)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const loops = data ?? [];
        setOpenLoops(loops);
        const states: Record<string, boolean[]> = {};
        loops.forEach((l) => {
          states[l.id] = l.task_state ?? l.tasks.map(() => false);
        });
        setTaskStates(states);
      });
  }, [userProfile, router]);

  const handleConfirmRemove = async () => {
    if (!pendingRemoveId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("loops")
      .update({ completed: true, abandoned: true })
      .eq("id", pendingRemoveId);
    if (error) {
      console.error("Failed to mark loop complete:", error?.message, error?.details, error?.hint);
    } else {
      setOpenLoops((prev) => prev?.filter((l) => l.id !== pendingRemoveId) ?? null);
    }
    setPendingRemoveId(null);
  };

  const handleTaskTap = async (loop: Loop) => {
    if (loop.tasks.length !== 1) return; // only acts on single-task loops
    const current = taskStates[loop.id] ?? [false];
    if (current[0]) return; // already complete, one-way only
    const newState = [true];

    setTaskStates((prev) => ({ ...prev, [loop.id]: newState }));
    setOpenLoops((prev) => prev?.filter((l) => l.id !== loop.id) ?? null);

    const supabase = createClient();

    await supabase
      .from("loops")
      .update({ task_state: newState, completed: true })
      .eq("id", loop.id)
      .eq("user_id", userProfile!.id);

    router.replace(`/loop-closed?id=${loop.id}`);
  };

  if (!userProfile) return null;

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1">
        {/* Custom top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <FeedbackSheet />
          <div className="flex-1" />
          <StarCountBadge />
          <Button variant="outline" size="sm" className="rounded-full">
            reflect
          </Button>
          <SettingsSheet />
        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col p-6 space-y-4">
          <h1 className="text-xl font-semibold">Your Loops</h1>
          <p className="text-sm text-muted-foreground">
            What&apos;s been sitting in the back of the mind?
          </p>

          {openLoops !== null && openLoops.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Repeat2 className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <p>Nothing open right now.</p>
                    <p className="text-muted-foreground">That&apos;s a good feeling.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {openLoops !== null && openLoops.length > 0 && openLoops.map((loop) => {
            const CategoryIcon = CATEGORY_ICON_MAP[loop.category] ?? null;
            if (!loop.tasks || loop.tasks.length === 0) {
              console.error(`Loop ${loop.id} has an empty tasks array`);
            }
            const firstTask = loop.tasks?.[0];
            const extraCount = (loop.tasks?.length ?? 0) - 1;
            const total = loop.tasks?.length ?? 0;
            const localState = taskStates[loop.id] ?? loop.task_state ?? loop.tasks.map(() => false);
            const firstDone = localState[0] ?? false;
            const done = localState.filter(Boolean).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isSingleTask = loop.tasks.length === 1;
            return (
              <Card key={loop.id}>
                <CardContent className="pt-4 pb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {CategoryIcon && <CategoryIcon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{loop.category} Tasks</span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={() => setPendingRemoveId(loop.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {firstTask && (
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full text-left"
                      onClick={() => isSingleTask && handleTaskTap(loop)}
                      disabled={!isSingleTask || firstDone}
                    >
                      {firstDone ? (
                        <CircleCheckBig className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm text-muted-foreground">{firstTask}</span>
                      {extraCount > 0 && (
                        <span className="text-xs text-muted-foreground">+{extraCount} more</span>
                      )}
                    </button>
                  )}
                  <ProgressField value={pct} />
                  <button
                    className="text-xs text-primary underline-offset-2 hover:underline self-start"
                    onClick={() => router.push(`/update-tasks?id=${loop.id}`)}
                  >
                    See all
                  </button>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex-1" />

          <div className="flex justify-end">
            <Button onClick={() => router.push("/outer-loop")}>+ Add a Loop</Button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!pendingRemoveId} onOpenChange={(open) => { if (!open) setPendingRemoveId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this loop?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <AlertDialogAction onClick={handleConfirmRemove}>
              Yes, Remove it
            </AlertDialogAction>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
