"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignInScreen } from "@/app/components/SignInScreen";
import type { Session } from "@supabase/supabase-js";

export default function Home() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      router.push("/signin/feeling");
    }
  }, [session, router]);

  if (session === undefined) return <div className="flex flex-1" />;
  if (!session) return <SignInScreen />;
  return <div className="flex flex-1" />;
}
