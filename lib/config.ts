/**
 * Configuration data access layer.
 *
 * Currently reads from YAML files at request time (server-side only).
 * Future: replace with Airtable or similar runtime config source.
 * Caching behaviour is controlled by Next.js server component caching.
 *
 * Do NOT import this file from client components.
 */

import fs from "fs";
import path from "path";
import type { HowOftenOption, HowOftenAction } from "@/lib/types";

// --- Types ---

export type CleaningTask = { task: string; icon: string };
export type CleaningData = Record<string, { icon: string; tasks: CleaningTask[] }>;

// --- Readers ---

export function getHowLongOptions(): string[] {
  const content = fs.readFileSync(
    path.join(process.cwd(), "yaml/HOWLONG.yaml"),
    "utf-8"
  );
  return content
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

export function getHowOftenOptions(): HowOftenOption[] {
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
      options.push({ label, action: action as HowOftenAction });
    }
  }
  return options;
}

export function getCleaningData(): CleaningData {
  const content = fs.readFileSync(
    path.join(process.cwd(), "yaml/CLEANING.yaml"),
    "utf-8"
  );
  const result: CleaningData = {};
  let currentCategory: string | null = null;

  for (const line of content.split("\n")) {
    if (!line.startsWith(" ") && line.trim().endsWith(":") && line.trim() !== "") {
      currentCategory = line.trim().slice(0, -1);
      result[currentCategory] = { icon: "", tasks: [] };
      continue;
    }
    if (!currentCategory) continue;

    const trimmed = line.trim();
    if (trimmed.startsWith("icon:") && !result[currentCategory].tasks.length) {
      result[currentCategory].icon = trimmed.slice("icon:".length).trim();
      continue;
    }
    if (trimmed.startsWith("- task:")) {
      const task = trimmed.slice("- task:".length).trim().replace(/^"|"$/g, "");
      result[currentCategory].tasks.push({ task, icon: "" });
      continue;
    }
    if (trimmed.startsWith("icon:") && result[currentCategory].tasks.length) {
      const lastTask = result[currentCategory].tasks[result[currentCategory].tasks.length - 1];
      if (!lastTask.icon) lastTask.icon = trimmed.slice("icon:".length).trim();
    }
  }
  return result;
}
