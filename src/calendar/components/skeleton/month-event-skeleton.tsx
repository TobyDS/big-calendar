import { Skeleton } from "@/calendar/components/skeleton/skeleton";
import { cn } from "@/utils/helpers/cn.helper";

interface SkeletonProps {
  className?: string;
}

export function MonthEventSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("mx-1 flex h-6.5 select-none flex-row items-center justify-between gap-1.5 rounded-md border px-2 py-1.5 lg:py-2", className)}
      style={{
        borderColor: "rgba(156, 163, 175, 0.2)",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
      }}
    >
      <Skeleton className="h-3 w-[6em]" />
      <Skeleton className="h-3 w-[2em]" />
    </div>
  );
}
