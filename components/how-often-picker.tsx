"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HowOftenOption } from "@/lib/types";

const DAYS = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface HowOftenPickerProps {
  options: HowOftenOption[];
  value: string;
  days: string[];
  onChange: (value: string, days: string[]) => void;
  onAdvance?: (value: string) => void; // called immediately on 'advance' action
}

/**
 * Reusable frequency picker component.
 *
 * Renders the how-often button group and day-chooser. Calling code supplies
 * the current value/days and handles persistence — this component is pure UI.
 *
 * - `onChange` is called when a selection is committed (advance, enable, or day save)
 * - `onAdvance` is an optional callback for the creation flow where 'advance'
 *   needs to trigger navigation immediately rather than just updating local state
 */
export function HowOftenPicker({
  options,
  value,
  days,
  onChange,
  onAdvance,
}: HowOftenPickerProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<HowOftenOption | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set(days));

  const showDayChooser =
    selectedFrequency?.action === "day-chooser-single" ||
    selectedFrequency?.action === "day-chooser-multi";

  const isMultiSelect = selectedFrequency?.action === "day-chooser-multi";

  const handleFrequencySelect = (option: HowOftenOption) => {
    if (option.action === "advance") {
      if (onAdvance) {
        onAdvance(option.label);
      } else {
        onChange(option.label, []);
      }
      return;
    }
    if (option.action === "enable") {
      onChange(option.label, []);
      setSelectedFrequency(option);
      setSelectedDays(new Set());
      return;
    }
    // day-chooser-single or day-chooser-multi — reveal day picker
    setSelectedFrequency(option);
    setSelectedDays(new Set());
  };

  const handleDayToggle = (day: string) => {
    if (isMultiSelect) {
      setSelectedDays((prev) => {
        const next = new Set(prev);
        next.has(day) ? next.delete(day) : next.add(day);
        return next;
      });
    } else {
      setSelectedDays(new Set([day]));
    }
  };

  const showAddThisLoop =
    selectedFrequency?.action === "enable" ||
    (showDayChooser && selectedDays.size > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Frequency buttons */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.label}
            variant="outline"
            className={cn(
              (selectedFrequency?.label === option.label ||
                (!selectedFrequency && value === option.label)) &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={() => handleFrequencySelect(option)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Day chooser */}
      {showDayChooser && (
        <div id="day-chooser">
          <hr className="border-border mb-3" />
          <div className="flex flex-wrap gap-2 justify-center">
            {DAYS.map((day) => (
              <Button
                key={day}
                variant="outline"
                className={cn(
                  selectedDays.has(day) &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => handleDayToggle(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Add This Loop / confirm button — used in creation flow */}
      {showAddThisLoop && (
        <Button
          className="w-full"
          disabled={showDayChooser && selectedDays.size === 0}
          onClick={() => {
            onChange(
              selectedFrequency?.label ?? value,
              showDayChooser ? [...selectedDays] : []
            );
          }}
        >
          Add This Loop
        </Button>
      )}
    </div>
  );
}
