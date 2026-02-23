import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">FlowMind</h1>
          <p className="text-muted-foreground text-sm">
            Advanced mobile demo. Choose a workflow to get started.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href="/fridge">Fridge</Link>
        </Button>
      </div>
    </div>
  );
}
