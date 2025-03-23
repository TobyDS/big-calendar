import { Skeleton } from "@/calendar/components/skeleton/skeleton";
import { cn } from "@/utils/helpers/cn.helper";

interface SkeletonProps {
  className?: string;
}

export function DayEventSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("flex h-full select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs", className)}
      style={{
        borderColor: "rgba(156, 163, 175, 0.2)",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
      }}
    >
      <Skeleton className="h-3 w-[min(80%,8em)]" />
      <Skeleton className="h-3 w-[min(100%,10em)]" />
    </div>
  );
}
