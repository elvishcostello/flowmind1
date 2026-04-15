/**
 * Returns the empathy label shown on the loop-closed screen.
 * Pure function — no side effects, easy to test.
 */
export function getEmpathyLabel(createdAt: Date, updatedAt: Date): string {
  const daysDiff = Math.round(
    (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDiff <= 1
    ? "You didn't let it sit long. That matters."
    : "You got it done.";
}

// Maps the day abbreviations used in HOWOFTEN.yaml / days[] to JS getDay() values (0 = Sunday)
const DAY_MAP: Record<string, number> = {
  Sun: 0, Mon: 1, Tues: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/**
 * Returns true if a pending (completed = NULL) repeating loop should be opened today.
 * Pure function — no side effects, easy to test.
 */
export function shouldOpenLoop(howOften: string, days: string[] | null, now = new Date()): boolean {
  switch (howOften) {
    case "daily":
      return true;
    case "weekly": {
      const target = days?.[0] != null ? DAY_MAP[days[0]] : -1;
      return now.getDay() === target;
    }
    case "specific days": {
      const targets = (days ?? []).map((d) => DAY_MAP[d]);
      return targets.includes(now.getDay());
    }
    case "monthly":
      return now.getDate() === 1;
    default:
      return false;
  }
}
