"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { Button } from "@/components/ui/button";

interface HowLongClientProps {
  options: string[];
}

export function HowLongClient({ options }: HowLongClientProps) {
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const subCategories: string[] = JSON.parse(
    decodeURIComponent(searchParams.get("sub-category") ?? "[]")
  );

  useEffect(() => {
    if (!userProfile) {
      router.push("/");
    }
  }, [userProfile, router]);

  if (!userProfile) return null;

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-sm flex flex-col flex-1 p-6 space-y-8">
        <p className="text-base">How long has this been on your mind?</p>

        <div className="space-y-3">
          {options.map((option) => (
            <Button
              key={option}
              variant="outline"
              className="w-full"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
