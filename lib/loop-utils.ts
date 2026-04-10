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
