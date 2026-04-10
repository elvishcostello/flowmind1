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
      router.replace("/your-loops");
    }
  }, [session, router]);

  useEffect(() => {
    if (!session) return;

    const supabase = createClient();

    supabase
      .rpc('increment', { row_id: session.user.id })
      .then(({ error }) => {
        if (error) console.error('increment session_count failed:', error?.message, error?.details, error?.hint);
      });

    supabase
      .from('user_activity')
      .update({ last_access: new Date().toISOString() })
      .eq('id', session.user.id)
      .then(({ error }) => {
        if (error) console.error('last_access update failed:', error?.message, error?.details, error?.hint);
      });
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (session === undefined) return <div className="flex flex-1" />;
  if (!session) return <SignInScreen />;
  return <div className="flex flex-1" />;
}
