"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HowOftenOption } from "./page";

const DAYS = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  const [selectedFrequency, setSelectedFrequency] = useState<HowOftenOption | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());

  const showDayChooser =
    selectedFrequency?.action === "day-chooser-single" ||
    selectedFrequency?.action === "day-chooser-multi";

  const isMultiSelect = selectedFrequency?.action === "day-chooser-multi";

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  if (!userProfile) return null;

  const showAddThisLoop =
    selectedFrequency?.action === "enable" ||
    (showDayChooser && selectedDays.size > 0);

  const handleFrequencySelect = (option: HowOftenOption) => {
    if (option.action === "advance") {
      router.push("/your-loops?refresh=true");
      return;
    }
    setSelectedFrequency(option);
    setSelectedDays(new Set());
  };

  const handleDayToggle = (day: string) => {
    if (isMultiSelect) {
      setSelectedDays((prev) => {
        const next = new Set(prev);
        next.has(day) ? next.delete(day) : next.add(day);
        return next;
      });
    } else {
      setSelectedDays(new Set([day]));
    }
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

        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option.label}
              variant="outline"
              data-action={option.action}
              className={cn(
                selectedFrequency?.label === option.label &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => handleFrequencySelect(option)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="-mt-6">
          <Button variant="link" className="px-0 text-muted-foreground underline" onClick={() => router.push("/your-loops?refresh=true")}>
            skip
          </Button>
        </div>

        {showDayChooser && (
          <div id="day-chooser">
            <hr className="border-border" />
            <div className="flex flex-wrap gap-2 mt-4">
              {DAYS.map((day) => (
                <Button
                  key={day}
                  variant="outline"
                  className={cn(
                    selectedDays.has(day) &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                  onClick={() => handleDayToggle(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        )}

        {showAddThisLoop && (
          <Button
            className="w-full"
            disabled={showDayChooser && selectedDays.size === 0}
            onClick={() => router.push("/your-loops?refresh=true")}
          >
            Add This Loop
          </Button>
        )}
      </div>
    </div>
  );
}
