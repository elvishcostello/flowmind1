"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [name, setName] = useState("");
  const { setUserProfile } = useUserProfile();
  const router = useRouter();

  function handleContinue() {
    if (!name.trim()) return;
    setUserProfile({ username: name.trim() });
    router.push("/signin/feeling");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <p className="font-serif text-2xl leading-relaxed">
          Welcome to Flowmind.
          <br />
          <br />
          You&apos;re one of the first people here.
        </p>
        <div className="space-y-3">
          <label className="block text-sm text-muted-foreground" htmlFor="name">
            What&apos;s your name?
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            className="w-full border-b border-border bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground/50 focus:border-foreground transition-colors"
            placeholder="Your name"
            autoFocus
          />
        </div>
        <Button onClick={handleContinue} disabled={!name.trim()} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}
