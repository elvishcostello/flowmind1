"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  UtensilsCrossed, Trash2, Sparkles, Microwave, LayoutGrid, Refrigerator,
  Pencil, Droplets, Toilet, Layers, ShowerHead, Box, Bed, ArrowUpToLine,
  Feather, Shirt, Wind, Sofa, LayoutList, Mail, Folder, Monitor, Cable,
  Trees, Sprout, Leaf, CloudSnow, Car, Package, PawPrint, Droplet,
  Star, Circle, CircleCheckBig, Plus, GripVertical,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UpdateTasksParams } from "@/lib/types";

// Static mirror of yaml/HOWOFTEN.yaml
type HowOftenOption = { label: string; action: string };
const HOW_OFTEN_OPTIONS: HowOftenOption[] = [
  { label: "one time",      action: "advance" },
  { label: "daily",         action: "enable" },
  { label: "weekly",        action: "day-chooser-single" },
  { label: "specific days", action: "day-chooser-multi" },
  { label: "monthly",       action: "enable" },
];
const DEFAULT_HOW_OFTEN = HOW_OFTEN_OPTIONS[0].label;

const DAYS = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Trash2, Sparkles, Microwave, LayoutGrid, Refrigerator,
  Pencil, Droplets, Toilet, Layers, ShowerHead, Box, Bed, ArrowUpToLine,
  Feather, Shirt, Wind, Sofa, LayoutList, Mail, Folder, Monitor, Cable,
  Trees, Sprout, Leaf, CloudSnow, Car, Package, PawPrint, Drop: Droplet,
};

type CleaningTask = { task: string; icon: string };

const CLEANING_DATA: Record<string, { icon: string; tasks: CleaningTask[] }> = {
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

function SortableTaskRow({
  id,
  task,
  done,
  mode,
  onToggle,
}: {
  id: string;
  task: string;
  done: boolean;
  mode: "primary" | "edit";
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Button
        variant="ghost"
        className="justify-start gap-2 h-auto py-2 px-2 border border-border w-full"
        onClick={onToggle}
      >
        {mode === "edit" ? (
          <span {...attributes} {...listeners} className="cursor-grab touch-none">
            <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />
          </span>
        ) : done ? (
          <CircleCheckBig className="h-5 w-5 shrink-0 text-primary" />
        ) : (
          <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
        <span className={done ? "line-through text-muted-foreground" : ""}>
          {task}
        </span>
      </Button>
    </div>
  );
}

type Loop = {
  id: string;
  category: string;
  tasks: string[];
  task_state: boolean[] | null;
  how_often: string | null;
  days: string[] | null;
};

export function UpdateTasksClient() {
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = UpdateTasksParams.safeParse({ id: searchParams.get("id") });
  const loopId = parsed.success ? parsed.data.id : null;

  const [loop, setLoop] = useState<Loop | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [tasks, setTasks] = useState<string[]>([]);
  const [taskState, setTaskState] = useState<boolean[]>([]);
  const [mode, setMode] = useState<"primary" | "edit">("primary");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [customTaskText, setCustomTaskText] = useState("");

  // how_often / change-mode state
  const [howOften, setHowOften] = useState<string>(DEFAULT_HOW_OFTEN);
  const [days, setDays] = useState<string[]>([]);
  const [isChangingFrequency, setIsChangingFrequency] = useState(false);
  const [pendingFrequency, setPendingFrequency] = useState<HowOftenOption | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.indexOf(active.id as string);
    const newIndex = tasks.indexOf(over.id as string);
    setTasks((prev) => arrayMove(prev, oldIndex, newIndex));
    setTaskState((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
      return;
    }
    if (!loopId) {
      router.push("/your-loops");
      return;
    }

    const supabase = createClient();

    supabase
      .from("loops")
      .select("id, category, tasks, task_state, how_often, days")
      .eq("id", loopId)
      .eq("user_id", userProfile.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Failed to load loop:", error);
          router.push("/your-loops");
          return;
        }
        setLoop(data);
        setTasks(data.tasks);
        setTaskState(data.task_state ?? data.tasks.map(() => false));
        setHowOften(data.how_often ?? DEFAULT_HOW_OFTEN);
        setDays(data.days ?? []);
      });

    supabase
      .from("loops")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userProfile.id)
      .eq("completed", true)
      .then(({ count }) => setCompletedCount(count ?? 0));
  }, [userProfile, router, loopId]);

  const saveLoop = async (): Promise<boolean> => {
    if (!loop) return false;
    const supabase = createClient();
    const { error } = await supabase
      .from("loops")
      .update({
        tasks,
        task_state: taskState,
        how_often: howOften,
        days: days.length > 0 ? days : null,
      })
      .eq("id", loop.id)
      .eq("user_id", userProfile!.id);
    if (error) {
      console.error("Failed to save loop:", error);
      return false;
    }
    return true;
  };

  const handleModeToggle = async () => {
    if (mode === "primary") {
      setMode("edit");
      return;
    }
    const ok = await saveLoop();
    if (ok) setMode("primary");
  };

  const handleBack = async () => {
    await saveLoop();
    router.back();
  };

  const toggleTask = (index: number) => {
    setTaskState((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const addTaskFromList = (task: string) => {
    setTasks((prev) => [...prev, task]);
    setTaskState((prev) => [...prev, false]);
  };

  const addCustomTask = () => {
    const text = customTaskText.trim();
    if (!text) return;
    setTasks((prev) => [...prev, text]);
    setTaskState((prev) => [...prev, false]);
    setCustomTaskText("");
  };

  const handleFrequencySelect = (option: HowOftenOption) => {
    setPendingFrequency(option);
    setSelectedDays(new Set());

    if (option.action === "advance" || option.action === "enable") {
      setHowOften(option.label);
      setDays([]);
      setIsChangingFrequency(false);
      setPendingFrequency(null);
    }
    // day-chooser actions stay in change-mode — wait for Save
  };

  const handleDayToggle = (day: string) => {
    if (pendingFrequency?.action === "day-chooser-multi") {
      setSelectedDays((prev) => {
        const next = new Set(prev);
        next.has(day) ? next.delete(day) : next.add(day);
        return next;
      });
    } else {
      setSelectedDays(new Set([day]));
    }
  };

  const handleFrequencySave = () => {
    if (!pendingFrequency) return;
    setHowOften(pendingFrequency.label);
    setDays([...selectedDays]);
    setIsChangingFrequency(false);
    setPendingFrequency(null);
    setSelectedDays(new Set());
  };

  const showDayChooser =
    pendingFrequency?.action === "day-chooser-single" ||
    pendingFrequency?.action === "day-chooser-multi";

  const saveDisabled = showDayChooser && selectedDays.size === 0;

  if (!userProfile || !loop) return null;

  const availableTasks = (CLEANING_DATA[loop.category]?.tasks ?? []).filter(
    (t) => !tasks.includes(t.task)
  );

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3">
          <Button
            variant="ghost"
            className="self-start -ml-2 text-muted-foreground"
            onClick={handleBack}
          >
            ← Back
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="rounded-full">
            <Star className="h-4 w-4" />
            {completedCount}
          </Button>
        </div>

        <hr className="border-border" />

        {/* Content */}
        <div className="flex flex-1 flex-col p-6 space-y-4">
          <h1 className="text-xl font-semibold">{loop.category} Tasks</h1>

          {/* Mode button */}
          <Button
            variant={mode === "edit" ? "default" : "outline"}
            className="self-start flex items-center gap-2"
            onClick={handleModeToggle}
          >
            {mode === "edit" ? (
              "Done Editing"
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit steps
              </>
            )}
          </Button>

          {/* How-often row */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="pointer-events-none">
              {(howOften === "specific days" || howOften === "weekly") && days.length > 0
                ? days.join(" ")
                : howOften}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsChangingFrequency((prev) => !prev);
                setPendingFrequency(null);
                setSelectedDays(new Set());
              }}
            >
              {isChangingFrequency ? "Cancel" : "Change"}
            </Button>
          </div>

          {/* Change-mode frequency picker */}
          {isChangingFrequency && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {HOW_OFTEN_OPTIONS.map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    size="sm"
                    className={cn(
                      pendingFrequency?.label === option.label &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={() => handleFrequencySelect(option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {showDayChooser && (
                <div>
                  <hr className="border-border mb-3" />
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <Button
                        key={day}
                        variant="outline"
                        size="sm"
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

              {showDayChooser && (
                <Button
                  className="w-full"
                  disabled={saveDisabled}
                  onClick={handleFrequencySave}
                >
                  Save
                </Button>
              )}
            </div>
          )}

          {/* Task list */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {tasks.map((task, i) => (
                  <SortableTaskRow
                    key={task}
                    id={task}
                    task={task}
                    done={taskState[i] ?? false}
                    mode={mode}
                    onToggle={() => toggleTask(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add a task button */}
          {!isAddingTask && (
            <Button
              variant="ghost"
              className="justify-start gap-2 h-auto py-2 px-2 border border-border w-full"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4" />
              Add a task
            </Button>
          )}

          {/* Add task group */}
          {isAddingTask && (
            <div className="flex flex-col gap-3 pt-2">
              {availableTasks.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {availableTasks.map(({ task, icon }) => {
                    const Icon = ICON_MAP[icon] ?? Pencil;
                    return (
                      <Card
                        key={task}
                        className="cursor-pointer hover:bg-accent transition-colors py-0"
                        onClick={() => addTaskFromList(task)}
                      >
                        <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-4">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm font-medium text-center leading-tight">
                            {task}
                          </span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTaskText}
                  onChange={(e) => setCustomTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTask()}
                  placeholder="Or type your own task..."
                  className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {customTaskText.trim() && (
                  <Button onClick={addCustomTask}>Add</Button>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAddingTask(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
