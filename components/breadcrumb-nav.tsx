"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SEGMENT_LABELS: Record<string, string> = {
  feeling: "You Know That Feeling",
  "cleaning-intro": "Introduction to Cleaning",
  loops: "Loops",
  "rewards-intro": "Introduction to Rewards",
  "your-loops": "Home",
  "outer-loop": "Add a Loop",
  "inner-loop": "Inner Loop",
};

// Explicit ancestor crumbs for app routes — defines the full trail above each route
const APP_ROUTE_ANCESTORS: Record<string, { label: string; href: string }[]> = {
  "outer-loop": [{ label: "Home", href: "/your-loops" }],
  "inner-loop": [{ label: "Home", href: "/your-loops" }, { label: "Add a Loop", href: "/outer-loop" }],
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname === "/" ? [] : pathname.split("/").filter(Boolean);
  const isHome = segments.length === 0;
  const ancestors = segments.length > 0 ? APP_ROUTE_ANCESTORS[segments[0]] : undefined;

  const root = ancestors ? null : { label: "Home", href: "/" };

  const crumbs = [
    ...(ancestors ?? (root ? [root] : [])),
    ...segments.map((seg, i) => ({
      label: SEGMENT_LABELS[seg] ?? seg,
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <div className="flex items-center gap-3">
      {!isHome && (
        <button
          onClick={() => router.push(crumbs[crumbs.length - 2].href)}
          aria-label="Go back"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
