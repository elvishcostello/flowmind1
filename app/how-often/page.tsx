import fs from "fs";
import path from "path";
import { HowOftenClient } from "./how-often-client";

function readHowOftenOptions(): string[] {
  const content = fs.readFileSync(
    path.join(process.cwd(), "yaml/HOWOFTEN.yaml"),
    "utf-8"
  );
  return content
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

export default function HowOftenPage() {
  const options = readHowOftenOptions();
  return <HowOftenClient options={options} />;
}
