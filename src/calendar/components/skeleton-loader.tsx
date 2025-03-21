"use client";

import { cn } from "@/utils/helpers/cn.helper";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", 
        className
      )} 
    />
  );
}

export function EventSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-md overflow-hidden", className)}>
      <div className="flex items-center space-x-2 p-2">
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function MonthEventSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <Skeleton className="h-5 w-full rounded-md" />
    </div>
  );
}

export function DayEventSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("h-full flex flex-col rounded-md border bg-background p-3", className)}>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
} 