import { NextRequest, NextResponse } from "next/server";
import {
  intakeResponse,
  treatmentResponse,
  summaryResponse,
} from "@/lib/canned-responses";

const DEMO_MODE = process.env.DEMO_MODE === "true";
const DEMO_DELAY_MS = 800;

const mockedRoutes = [
  { pattern: /\/api\/intake/, response: intakeResponse },
  { pattern: /\/api\/recommend/, response: treatmentResponse },
  { pattern: /\/api\/summary/, response: summaryResponse },
];

export async function proxy(request: NextRequest) {
  if (!DEMO_MODE) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const matched = mockedRoutes.find((r) => r.pattern.test(pathname));

  if (!matched) return NextResponse.next();

  await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS));

  return NextResponse.json(matched.response);
}

export const config = {
  matcher: ["/api/:path*"],
};
