import { Suspense } from "react";
import { LoopClosedClient } from "./loop-closed-client";

export default function LoopClosedPage() {
  return (
    <Suspense>
      <LoopClosedClient />
    </Suspense>
  );
}
