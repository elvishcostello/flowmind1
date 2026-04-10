"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Repeat2, Sun, CloudSun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoopClosedParams } from "@/lib/types";
import { getEmpathyLabel } from "@/lib/loop-utils";

const MOOD_OPTIONS = [
  { label: "All good",        Icon: Sun },
  { label: "A little tense",  Icon: CloudSun },
  { label: "Pretty stressed", Icon: Cloud },
  { label: "Overwhelmed",     Icon: CloudRain },
  { label: "Crashed Out",     Icon: CloudLightning },
] as const;

type Loop = {
  id: string;
  tasks: string[];
  created_at: string | null;
  updated_at: string | null;
};

export function LoopClosedClient() {
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = LoopClosedParams.safeParse({ id: searchParams.get("id") });
  const loopId = parsed.success ? parsed.data.id : null;

  const [loop, setLoop] = useState<Loop | null>(null);
  const [mood, setMood] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) { router.push("/"); return; }
    if (!loopId) { router.replace("/your-loops"); return; }

    const supabase = createClient();
    supabase
      .from("loops")
      .select("id, tasks, created_at, updated_at")
      .eq("id", loopId)
      .eq("user_id", userProfile.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.replace("/your-loops"); return; }
        setLoop(data);
      });
  }, [userProfile, router, loopId]);

  if (!userProfile || !loop) return null;

  const now = new Date();
  const updatedAt = loop.updated_at ? new Date(loop.updated_at) : now;
  const createdAt = loop.created_at
    ? new Date(loop.created_at)
    : new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const empathy = getEmpathyLabel(createdAt, updatedAt);

  const taskCount = loop.tasks.length;
  const displayName = (userProfile.username ?? userProfile.email ?? "friend").toLowerCase();

  const handleExit = async () => {
    const supabase = createClient();

    const { data: activity } = await supabase
      .from("user_activity")
      .select("star_count")
      .eq("id", userProfile.id)
      .single();

    await supabase
      .from("user_activity")
      .update({ star_count: (activity?.star_count ?? 0) + taskCount })
      .eq("id", userProfile.id);

    await supabase
      .from("loops")
      .update({ mood })
      .eq("id", loop.id)
      .eq("user_id", userProfile.id);

    router.replace("/your-loops");
  };

  const toggleMood = (label: string) => {
    setMood((prev) => (prev === label ? null : label));
  };

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1 p-6 space-y-6">
        <div className="flex flex-col items-center gap-4 pt-8">
          <Repeat2 className="h-16 w-16 text-primary" />
          <h1 className="text-xl font-semibold text-center">
            {displayName}, loop closed.
          </h1>
          <p className="text-sm text-muted-foreground text-center">{empathy}</p>
          <p className="text-sm font-semibold text-center">+{taskCount} stars</p>
        </div>

        <hr className="border-border" />

        <div className="flex flex-col gap-4">
          <p className="text-sm text-center">How do you feel compared to before?</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {MOOD_OPTIONS.map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleMood(label)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition-colors",
                  mood === label
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleExit}>
          ← Back to My Loops
        </Button>
      </div>
    </div>
  );
}
