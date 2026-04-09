import { Suspense } from "react";
import { InnerLoopClient } from "./inner-loop-client";
import { getCleaningData } from "@/lib/config";

export default function InnerLoopPage() {
  const cleaningData = getCleaningData();
  return (
    <Suspense>
      <InnerLoopClient cleaningData={cleaningData} />
    </Suspense>
  );
}
