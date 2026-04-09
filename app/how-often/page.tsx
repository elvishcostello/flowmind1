import { Suspense } from "react";
import { HowOftenClient } from "./how-often-client";
import { getHowOftenOptions } from "@/lib/config";

export default function HowOftenPage() {
  const options = getHowOftenOptions();
  return (
    <Suspense>
      <HowOftenClient options={options} />
    </Suspense>
  );
}
