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

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Trash2, Sparkles, Microwave, LayoutGrid, Refrigerator,
  Pencil, Droplets, Toilet, Layers, ShowerHead, Box, Bed, ArrowUpToLine,
  Feather, Shirt, Wind, Sofa, LayoutList, Mail, Folder, Monitor, Cable,
  Trees, Sprout, Leaf, CloudSnow, Car, Package, PawPrint, Drop: Droplet,
};

type Task = { task: string; icon: string };

const CLEANING_DATA: Record<string, { icon: string; tasks: Task[] }> = {
  Kitchen: {
    icon: "ChefHat",
    tasks: [
      { task: "Wash the dishes", icon: "UtensilsCrossed" },
      { task: "Empty the trash", icon: "Trash2" },
      { task: "Wipe down counters", icon: "Sparkles" },
      { task: "Wipe the stovetop", icon: "Sparkles" },
      { task: "Clean the floor", icon: "Sparkles" },
      { task: "Clean the microwave", icon: "Microwave" },
      { task: "Organize the pantry", icon: "LayoutGrid" },
      { task: "Clean the fridge", icon: "Refrigerator" },
      { task: "Other", icon: "Pencil" },
    ],
  },
  Bathroom: {
    icon: "Droplets",
    tasks: [
      { task: "Clean the sink", icon: "Drop" },
      { task: "Clean the toilet", icon: "Toilet" },
      { task: "Wipe the mirror", icon: "Sparkles" },
      { task: "Replace towels", icon: "Layers" },
      { task: "Scrub the shower", icon: "ShowerHead" },
      { task: "Mop the floor", icon: "Sparkles" },
      { task: "Restock supplies", icon: "Box" },
      { task: "Other", icon: "Pencil" },
    ],
  },
  Bedroom: {
    icon: "Bed",
    tasks: [
      { task: "Sort the laundry", icon: "Layers" },
      { task: "Pick up the floor", icon: "ArrowUpToLine" },
      { task: "Change the sheets", icon: "Bed" },
      { task: "Dust surfaces", icon: "Feather" },
      { task: "Organize the closet", icon: "Shirt" },
      { task: "Vacuum", icon: "Wind" },
      { task: "Other", icon: "Pencil" },
    ],
  },
  "Living Room": {
    icon: "Sofa",
    tasks: [
      { task: "Clear the surfaces", icon: "Sparkles" },
      { task: "Clear the clutter", icon: "Trash2" },
      { task: "Vacuum", icon: "Wind" },
      { task: "Wipe down furniture", icon: "Sparkles" },
      { task: "Clean windows", icon: "Sparkles" },
      { task: "Organize shelves", icon: "LayoutList" },
      { task: "Other", icon: "Pencil" },
    ],
  },
  Office: {
    icon: "Monitor",
    tasks: [
      { task: "Clear the desk", icon: "Sparkles" },
      { task: "Sort the inbox pile", icon: "Mail" },
      { task: "File papers", icon: "Folder" },
      { task: "Wipe down surfaces", icon: "Sparkles" },
      { task: "Organize supplies", icon: "Box" },
      { task: "Untangle cables", icon: "Cable" },
      { task: "Other", icon: "Pencil" },
    ],
  },
  Outside: {
    icon: "Trees",
    tasks: [
      { task: "Take out trash and recycling", icon: "Trash2" },
      { task: "Sweep the porch", icon: "Wind" },
      { task: "Water plants", icon: "Sprout" },
      { task: "Mow the lawn", icon: "Sprout" },
      { task: "Rake leaves", icon: "Leaf" },
      { task: "Shovel snow", icon: "CloudSnow" },
      { task: "Other", icon: "Pencil" },
    ],
  },
  Car: {
    icon: "Car",
    tasks: [
      { task: "Clear out trash", icon: "Trash2" },
      { task: "Vacuum interior", icon: "Wind" },
      { task: "Wipe down dashboard", icon: "Sparkles" },
      { task: "Clean windows", icon: "Sparkles" },
      { task: "Wash the exterior", icon: "Droplets" },
      { task: "Tidy the trunk", icon: "Package" },
      { task: "Other", icon: "Pencil" },
    ],
  },
  Pet: {
    icon: "PawPrint",
    tasks: [
      { task: "Clean water bowl", icon: "Drop" },
      { task: "Wash food bowl", icon: "UtensilsCrossed" },
      { task: "Clean litter box", icon: "Box" },
      { task: "Vacuum pet hair", icon: "Wind" },
      { task: "Wash pet bedding", icon: "Sparkles" },
      { task: "Give them a bath", icon: "Droplets" },
      { task: "Other", icon: "Pencil" },
    ],
  },
};

export default function InnerLoopPage() {
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

  const categoryData = CLEANING_DATA[category];
  const tasks = categoryData?.tasks ?? [];

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
