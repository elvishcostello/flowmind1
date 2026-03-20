"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Repeat2 } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile-context";
import { Button } from "@/components/ui/button";

export default function FeelingPage() {
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
          <p>
            You know that feeling when something is on your mind — not urgent, not forgotten, just
            sitting there, taking up space?
          </p>
          <p>
            It could be a conversation you need to have. A project you haven&apos;t started. A
            decision you keep putting off.
          </p>
          <p>
            Your brain keeps returning to it, checking to see if it&apos;s been handled yet. It
            hasn&apos;t. So it checks again.
          </p>
          <p>That loop has a name.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Repeat2 className="h-5 w-5 shrink-0" />
          <span>that&apos;s an open loop</span>
        </div>
        <Button onClick={() => router.push("/signin/cleaning-intro")} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}
