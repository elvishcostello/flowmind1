"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Star, Circle, CircleCheckBig, Pencil } from "lucide-react";
import { UpdateTasksParams } from "@/lib/types";

type Loop = {
  id: string;
  category: string;
  tasks: string[];
  task_state: boolean[] | null;
};

export function UpdateTasksClient() {
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = UpdateTasksParams.safeParse({ id: searchParams.get("id") });
  const loopId = parsed.success ? parsed.data.id : null;

  const [loop, setLoop] = useState<Loop | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [taskState, setTaskState] = useState<boolean[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
      return;
    }
    if (!loopId) {
      router.push("/your-loops");
      return;
    }

    const supabase = createClient();

    supabase
      .from("loops")
      .select("id, category, tasks, task_state")
      .eq("id", loopId)
      .eq("user_id", userProfile.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Failed to load loop:", error);
          router.push("/your-loops");
          return;
        }
        setLoop(data);
        // If task_state is null, initialise to all-false
        setTaskState(data.task_state ?? data.tasks.map(() => false));
      });

    supabase
      .from("loops")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userProfile.id)
      .eq("completed", true)
      .then(({ count }) => setCompletedCount(count ?? 0));
  }, [userProfile, router, loopId]);

  const saveTaskState = async (): Promise<boolean> => {
    if (!loop) return false;
    const supabase = createClient();
    const { error } = await supabase
      .from("loops")
      .update({ task_state: taskState })
      .eq("id", loop.id)
      .eq("user_id", userProfile!.id);
    if (error) {
      console.error("Failed to save task_state:", error);
      return false;
    }
    return true;
  };

  const handleModeToggle = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    const ok = await saveTaskState();
    if (ok) setIsEditing(false);
  };

  const handleBack = async () => {
    await saveTaskState();
    router.back();
  };

  const toggleTask = (index: number) => {
    setTaskState((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  if (!userProfile || !loop) return null;

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            className="self-start -ml-2 text-muted-foreground"
            onClick={handleBack}
          >
            ← Back
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="rounded-full">
            <Star className="h-4 w-4" />
            {completedCount}
          </Button>
        </div>

        <hr className="border-border" />

        {/* Content */}
        <div className="flex flex-1 flex-col p-6 space-y-4">
          <h1 className="text-xl font-semibold">{loop.category} Tasks</h1>

          <Button
            variant="outline"
            className="self-start flex items-center gap-2"
            onClick={handleModeToggle}
          >
            {isEditing ? (
              "Done Editing"
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit steps
              </>
            )}
          </Button>

          <div className="flex flex-col gap-2 mt-2">
            {loop.tasks.map((task, i) => {
              const done = taskState[i] ?? false;
              return (
                <Button
                  key={i}
                  variant="ghost"
                  className="justify-start gap-2 h-auto py-2 px-2 border border-border"
                  onClick={() => toggleTask(i)}
                >
                  {done ? (
                    <CircleCheckBig className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className={done ? "line-through text-muted-foreground" : ""}>
                    {task}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
