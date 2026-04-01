import fs from "fs";
import path from "path";
import { HowLongClient } from "./how-long-client";

function readHowLongOptions(): string[] {
  const content = fs.readFileSync(
    path.join(process.cwd(), "yaml/HOWLONG.yaml"),
    "utf-8"
  );
  return content
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

export default function HowLongPage() {
  const options = readHowLongOptions();
  return <HowLongClient options={options} />;
}
