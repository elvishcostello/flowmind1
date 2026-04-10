"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { HowOftenPicker } from "@/components/how-often-picker";
import type { HowOftenOption } from "@/lib/types";

interface HowOftenClientProps {
  options: HowOftenOption[];
}

export function HowOftenClient({ options }: HowOftenClientProps) {
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const tasks: string[] = JSON.parse(
    decodeURIComponent(searchParams.get("tasks") ?? "[]")
  );
  const howLong = searchParams.get("how-long") ?? "";

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  if (!userProfile) return null;

  const persistLoop = async (howOften: string | null, days: string[] | null) => {
    const supabase = createClient();
    const { error } = await supabase.from("loops").insert({
      user_id: userProfile.id,
      category,
      tasks,
      how_long: howLong || null,
      how_often: howOften,
      days: days && days.length > 0 ? days : null,
      completed: false,
    });
    if (error) console.error("loop insert failed:", error.message, error.details, error.hint);
  };

  const handleChange = async (value: string, days: string[]) => {
    await persistLoop(value, days.length > 0 ? days : null);
    router.refresh();
    router.replace("/your-loops");
  };

  const handleAdvance = async (value: string) => {
    await persistLoop(value, null);
    router.refresh();
    router.replace("/your-loops");
  };

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1 p-6 space-y-8">
        <Button
          variant="ghost"
          className="self-start -ml-2 text-muted-foreground"
          onClick={() => router.back()}
        >
          ← Back
        </Button>

        <p className="text-base">How often does this need doing?</p>

        <HowOftenPicker
          options={options}
          value=""
          days={[]}
          onChange={handleChange}
          onAdvance={handleAdvance}
        />

        <div className="-mt-6">
          <Button
            variant="link"
            className="px-0 text-muted-foreground underline"
            onClick={async () => {
              await persistLoop(null, null);
              router.refresh();
              router.replace("/your-loops");
            }}
          >
            skip
          </Button>
        </div>
      </div>
    </div>
  );
}
