"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useUserProfile } from "@/lib/user-profile-context";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const REWARDS = [
  { stars: 1, label: "a piece of chocolate" },
  { stars: 5, label: "Coffee Break" },
  { stars: 10, label: "Episode of a Show" },
];

export default function RewardsIntroPage() {
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
          <p>Closing loops earns you stars.</p>
          <p>Spend them on whatever feels good to you.</p>
        </div>

        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="space-y-3">
              {REWARDS.map(({ stars, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <Star className="h-4 w-4 shrink-0" />
                  <span className="w-4 text-sm font-medium">{stars}</span>
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">+ add your own</p>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={() => router.push("/your-loops")}>
          Continue
        </Button>
      </div>
    </div>
  );
}
