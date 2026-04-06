import fs from "fs";
import path from "path";
import { Suspense } from "react";
import { HowOftenClient } from "./how-often-client";

export type HowOftenOption = { label: string; action: string };

function readHowOftenOptions(): HowOftenOption[] {
  const content = fs.readFileSync(
    path.join(process.cwd(), "yaml/HOWOFTEN.yaml"),
    "utf-8"
  );
  const lines = content.split("\n").filter((l) => l.trim());
  const options: HowOftenOption[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith(" ") && line.endsWith(":")) {
      const label = line.slice(0, -1).trim();
      const actionLine = lines[i + 1]?.trim() ?? "";
      const action = actionLine.startsWith("action:")
        ? actionLine.slice("action:".length).trim()
        : "";
      options.push({ label, action });
    }
  }
  return options;
}

export default function HowOftenPage() {
  const options = readHowOftenOptions();
  return (
    <Suspense>
      <HowOftenClient options={options} />
    </Suspense>
  );
}
