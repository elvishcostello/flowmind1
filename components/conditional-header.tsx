"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export function ConditionalHeader() {
  const pathname = usePathname();

  if (pathname === "/your-loops") return null;

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b border-border px-4 py-3">
      <BreadcrumbNav />
    </header>
  );
}
