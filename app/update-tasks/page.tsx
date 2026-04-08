import { Suspense } from "react";
import { UpdateTasksClient } from "./update-tasks-client";

export default function UpdateTasksPage() {
  return (
    <Suspense>
      <UpdateTasksClient />
    </Suspense>
  );
}
