import { Suspense } from "react";
import { HowLongClient } from "./how-long-client";
import { getHowLongOptions } from "@/lib/config";

export default function HowLongPage() {
  const options = getHowLongOptions();
  return (
    <Suspense>
      <HowLongClient options={options} />
    </Suspense>
  );
}
