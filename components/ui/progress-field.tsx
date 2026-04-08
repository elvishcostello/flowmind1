import { Progress } from "@/components/ui/progress";

interface ProgressFieldProps {
  value: number; // 0–100
}

export function ProgressField({ value }: ProgressFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Progress value={value} className="h-2" />
      <span className="text-xs text-muted-foreground">{value}% complete</span>
    </div>
  );
}
