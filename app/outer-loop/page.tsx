"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChefHat,
  Droplets,
  Bed,
  Sofa,
  Monitor,
  Trees,
  Car,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

const CATEGORIES: { name: string; icon: LucideIcon }[] = [
  { name: "Kitchen", icon: ChefHat },
  { name: "Bathroom", icon: Droplets },
  { name: "Bedroom", icon: Bed },
  { name: "Living Room", icon: Sofa },
  { name: "Office", icon: Monitor },
  { name: "Outside", icon: Trees },
  { name: "Car", icon: Car },
  { name: "Pet", icon: PawPrint },
];

export default function OuterLoopPage() {
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
      <div className="w-full max-w-sm flex flex-col flex-1 p-6 space-y-8">
        <div className="space-y-5 text-base leading-relaxed">
          <p>Where is it?</p>
          <p className="text-muted-foreground">Pick the room or area.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Card
              key={name}
              className="cursor-pointer hover:bg-accent transition-colors py-0"
              onClick={() =>
                router.push(`/inner-loop?category=${encodeURIComponent(name)}`)
              }
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-4">
                <Icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">{name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
