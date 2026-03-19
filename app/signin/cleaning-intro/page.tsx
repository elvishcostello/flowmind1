"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Check, Star } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile-context";
import { Button } from "@/components/ui/button";

export default function CleaningIntroPage() {
  const { userProfile } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!userProfile) {
      router.push("/signin");
    }
  }, [userProfile, router]);

  if (!userProfile) return null;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-5 text-base leading-relaxed">
          <p>You&apos;re testing the cleaning module.</p>
          <p>
            Flowmind is going to be more than just cleaning. But you&apos;re helping us understand
            what closing a loop actually feels like.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <CirclePlus className="h-5 w-5 shrink-0" />
            <span>Add what&apos;s on your mind</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Check className="h-5 w-5 shrink-0" />
            <span>Check off each task</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Star className="h-5 w-5 shrink-0" />
            <span>Watch your loops close</span>
          </div>
        </div>
        <Button onClick={() => router.push("/loops")} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}
