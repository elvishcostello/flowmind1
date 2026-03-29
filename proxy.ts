import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  intakeResponse,
  treatmentResponse,
  summaryResponse,
} from "@/lib/canned-responses";

const mockedRoutes = [
  { pattern: /\/api\/intake/, response: intakeResponse },
  { pattern: /\/api\/recommend/, response: treatmentResponse },
  { pattern: /\/api\/summary/, response: summaryResponse },
];

export async function proxy(request: NextRequest) {
  // 1. Demo mode — return early with canned response if matched
  if (process.env.DEMO_MODE === "true") {
    for (const route of mockedRoutes) {
      if (route.pattern.test(request.nextUrl.pathname)) {
        return Response.json(route.response);
      }
    }
  }

  // 2. Supabase session refresh
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
