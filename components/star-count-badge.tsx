"use client";

import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function StarCountBadge() {
  const { userProfile } = useUserProfile();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userProfile) return;
    const supabase = createClient();
    supabase
      .from("user_activity")
      .select("star_count")
      .eq("id", userProfile.id)
      .single()
      .then(({ data }) => setCount(data?.star_count ?? 0));
  }, [userProfile]);

  return (
    <Button variant="outline" size="sm" className="rounded-full">
      <Star className="h-4 w-4" />
      {count}
    </Button>
  );
}
