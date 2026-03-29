"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserProfile = { username: string };

type UserProfileContextType = {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
};

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setUserProfile({
          username: user.user_metadata?.full_name ?? user.email ?? "User",
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserProfile(
        user
          ? { username: user.user_metadata?.full_name ?? user.email ?? "User" }
          : null
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}
