"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";

export default function CleaningPage() {
  const { userProfile } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!userProfile) {
      router.push("/signin");
    }
  }, [userProfile, router]);

  if (!userProfile) return null;

  return <div className="flex flex-1" />;
}
