import { cn } from "@/utils/helpers/cn.helper";
import { Skeleton } from "@/calendar/components/skeleton/skeleton";

interface SkeletonProps {
  className?: string;
}

export function MonthEventSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-row select-none items-center justify-between gap-1.5 py-1.5 lg:py-2 px-2 mx-1 h-6.5 rounded-md border", className)}
      style={{ 
        borderColor: 'rgba(156, 163, 175, 0.2)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)'
    }}>
      <Skeleton className="h-3 w-[6em]" />
      <Skeleton className="h-3 w-[2em]" />
    </div>
  );
} 