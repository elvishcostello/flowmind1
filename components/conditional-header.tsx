"use client";

import { usePathname } from "next/navigation";
import { BackNav } from "@/components/breadcrumb-nav";

const SUPPRESS_HEADER = ["/", "/your-loops", "/loop-closed"];

export function ConditionalHeader() {
  const pathname = usePathname();

  if (SUPPRESS_HEADER.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b border-border px-4 py-3">
      <BackNav />
    </header>
  );
}
