"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserProfile } from "@/lib/user-profile-context";
import { createClient } from "@/lib/supabase/client";

export function FeedbackSheet() {
  const { userProfile } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [thumbs, setThumbs] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const resetState = () => {
    setText("");
    setThumbs(null);
    setSubmitted(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetState();
  };

  const handleThumb = (value: boolean) => {
    setThumbs((prev) => (prev === value ? null : value));
  };

  const handleSubmit = async () => {
    if (!text.trim() || !userProfile) return;
    const supabase = createClient();
    const { error } = await supabase.from("feedback").insert({
      user_id: userProfile.id,
      feedback_text: text.trim(),
      thumbs_up: thumbs,
    });
    if (error) {
      console.error("Failed to submit feedback:", error);
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      resetState();
    }, 2000);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          Feedback
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="flex flex-col rounded-t-2xl max-h-[85vh]">
        <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
          {submitted ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <p className="text-lg font-semibold">Thanks!</p>
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>We welcome your feedback!</SheetTitle>
              </SheetHeader>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="type your feedback here"
                className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                style={{ height: "40svh" }}
              />

              <div className="flex items-center gap-2 mt-4">
                <Button
                  type="button"
                  variant={thumbs === true ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleThumb(true)}
                  aria-label="Thumbs up"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={thumbs === false ? "default" : "outline"}
                  size="icon"
                  onClick={() => handleThumb(false)}
                  aria-label="Thumbs down"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                  type="button"
                  disabled={!text.trim()}
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
