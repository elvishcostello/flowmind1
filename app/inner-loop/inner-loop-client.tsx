"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed, Trash2, Sparkles, Microwave, LayoutGrid, Refrigerator,
  Pencil, Droplets, Toilet, Layers, ShowerHead, Box, Bed, ArrowUpToLine,
  Feather, Shirt, Wind, Sofa, LayoutList, Mail, Folder, Monitor, Cable,
  Trees, Sprout, Leaf, CloudSnow, Car, Package, PawPrint, Droplet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CleaningData } from "@/lib/config";

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Trash2, Sparkles, Microwave, LayoutGrid, Refrigerator,
  Pencil, Droplets, Toilet, Layers, ShowerHead, Box, Bed, ArrowUpToLine,
  Feather, Shirt, Wind, Sofa, LayoutList, Mail, Folder, Monitor, Cable,
  Trees, Sprout, Leaf, CloudSnow, Car, Package, PawPrint, Drop: Droplet,
};

export function InnerLoopClient({ cleaningData }: { cleaningData: CleaningData }) {
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  if (!userProfile) return null;

  const tasks = cleaningData[category]?.tasks ?? [];

  const toggleTask = (task: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(task) ? next.delete(task) : next.add(task);
      return next;
    });
  };

  const addLabel =
    selected.size === 0
      ? "Add Tasks"
      : selected.size === 1
      ? "Add 1 Task"
      : `Add ${selected.size} Tasks`;

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1 p-6 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            {category}
          </p>
          <p className="text-base">What needs doing?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tasks.map(({ task, icon }) => {
            const Icon = ICON_MAP[icon] ?? Pencil;
            const isSelected = selected.has(task);
            return (
              <Card
                key={task}
                className={cn(
                  "cursor-pointer transition-colors py-0",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-accent"
                )}
                onClick={() => toggleTask(task)}
              >
                <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-4">
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      isSelected ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span className="text-sm font-medium text-center leading-tight">
                    {task}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex-1" />

        <Button
          className="w-full"
          disabled={selected.size === 0}
          onClick={() =>
            router.push(
              `/how-long?category=${encodeURIComponent(category)}&tasks=${encodeURIComponent(JSON.stringify([...selected]))}`
            )
          }
        >
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
