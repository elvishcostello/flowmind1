"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Repeat2 } from "lucide-react";
import { SettingsSheet } from "@/components/settings-sheet";

export default function YourLoopsPage() {
  const { userProfile } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  if (!userProfile) return null;

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1">
        {/* Custom top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="tracking-widest text-xs font-medium">FLOWMIND</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="rounded-full">
            <Star className="h-4 w-4" />
            0
          </Button>
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

          <div className="flex-1" />

          <div className="flex justify-end">
            <Button>+ Add a Loop</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
