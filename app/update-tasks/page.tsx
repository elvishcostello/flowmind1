import { Suspense } from "react";
import { UpdateTasksClient } from "./update-tasks-client";
import { getHowOftenOptions, getCleaningData } from "@/lib/config";
import type { CleaningData } from "@/lib/config";

export type { CleaningData };

export default function UpdateTasksPage() {
  const howOftenOptions = getHowOftenOptions();
  const cleaningData = getCleaningData();
  return (
    <Suspense>
      <UpdateTasksClient howOftenOptions={howOftenOptions} cleaningData={cleaningData} />
    </Suspense>
  );
}
