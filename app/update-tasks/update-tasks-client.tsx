"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HowOftenPicker } from "@/components/how-often-picker";
import { StarCountBadge } from "@/components/star-count-badge";
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
  Circle, CircleCheckBig, Plus, GripVertical, X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UpdateTasksParams } from "@/lib/types";
import type { HowOftenAction } from "@/lib/types";
import type { HowOftenOption } from "@/lib/types";
import type { CleaningData } from "./page";

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Trash2, Sparkles, Microwave, LayoutGrid, Refrigerator,
  Pencil, Droplets, Toilet, Layers, ShowerHead, Box, Bed, ArrowUpToLine,
  Feather, Shirt, Wind, Sofa, LayoutList, Mail, Folder, Monitor, Cable,
  Trees, Sprout, Leaf, CloudSnow, Car, Package, PawPrint, Drop: Droplet,
};

function SortableTaskRow({
  id,
  task,
  done,
  mode,
  onToggle,
  onDelete,
}: {
  id: string;
  task: string;
  done: boolean;
  mode: "primary" | "edit";
  onToggle: () => void;
  onDelete: () => void;
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
        <span className={cn(done ? "line-through text-muted-foreground" : "", "flex-1 text-left")}>
          {task}
        </span>
        {mode === "edit" && (
          <span
            className="ml-2 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <X className="h-4 w-4" />
          </span>
        )}
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

export function UpdateTasksClient({
  howOftenOptions,
  cleaningData,
}: {
  howOftenOptions: HowOftenOption[];
  cleaningData: CleaningData;
}) {
  const DEFAULT_HOW_OFTEN = howOftenOptions[0]?.label ?? "";

  const { userProfile } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = UpdateTasksParams.safeParse({ id: searchParams.get("id") });
  const loopId = parsed.success ? parsed.data.id : null;

  const [loop, setLoop] = useState<Loop | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);
  const [taskState, setTaskState] = useState<boolean[]>([]);
  const [mode, setMode] = useState<"primary" | "edit">("primary");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [customTaskText, setCustomTaskText] = useState("");
  const [howOften, setHowOften] = useState<string>(DEFAULT_HOW_OFTEN);
  const [days, setDays] = useState<string[]>([]);
  const [isChangingFrequency, setIsChangingFrequency] = useState(false);

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

  const toggleTask = async (index: number) => {
    const newTaskState = taskState.map((v, i) => (i === index ? !v : v));
    setTaskState(newTaskState);

    if (newTaskState.length > 0 && newTaskState.every(Boolean)) {
      if (!loop) return;
      const supabase = createClient();
      await supabase
        .from("loops")
        .update({
          tasks,
          task_state: newTaskState,
          how_often: howOften,
          days: days.length > 0 ? days : null,
          completed: true,
        })
        .eq("id", loop.id)
        .eq("user_id", userProfile!.id);
      router.replace(`/loop-closed?id=${loop.id}`);
    }
  };

  const deleteTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    setTaskState((prev) => prev.filter((_, i) => i !== index));
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

  // Derive display value for how_often label
  const howOftenDisplayValue = (() => {
    const action = howOftenOptions.find(o => o.label === howOften)?.action as HowOftenAction | undefined;
    const showDays = (action === "day-chooser-single" || action === "day-chooser-multi") && days.length > 0;
    return showDays ? days.join(" ") : howOften;
  })();

  if (!userProfile || !loop) return null;

  const availableTasks = (cleaningData[loop.category]?.tasks ?? []).filter(
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
          <StarCountBadge />
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
            <span className="text-sm font-bold">{howOftenDisplayValue}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChangingFrequency((prev) => !prev)}
            >
              {isChangingFrequency ? "Cancel" : "Change"}
            </Button>
          </div>

          {/* Change-mode frequency picker */}
          {isChangingFrequency && (
            <HowOftenPicker
              options={howOftenOptions}
              value={howOften}
              days={days}
              onChange={(value, newDays) => {
                setHowOften(value);
                setDays(newDays);
                setIsChangingFrequency(false);
              }}
            />
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
                    onDelete={() => deleteTask(i)}
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
