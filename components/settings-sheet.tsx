"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";

export function SettingsSheet() {
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const [open, setOpen] = useState(false);

  const displayName = userProfile?.username ?? "Your Account";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  };

  const handleReturnToOrientation = () => {
    setOpen(false);
    router.push("/signin/feeling");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col max-w-sm">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        {/* Identity block */}
        <div className="flex items-center gap-3 py-4">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium shrink-0">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm truncate">{displayName}</span>
          </div>
        </div>

        {/* Middle zone — future settings sections go here */}
        <div className="flex-1">
          {/* TODO: Add notification settings, appearance, AI behavior, etc. */}
        </div>

        {/* Bottom zone */}
        <div className="flex flex-col gap-2 pb-4">
          <Separator className="mb-2" />
          <Button
            variant="outline"
            className="w-full"
            onClick={handleReturnToOrientation}
          >
            Return to Orientation
          </Button>
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
