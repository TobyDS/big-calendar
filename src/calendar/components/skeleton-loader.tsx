"use client";

import { cn } from "@/utils/helpers/cn.helper";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-md", 
        className
      )} 
      style={{ 
        backgroundColor: 'rgba(156, 163, 175, 0.5)'
      }}
    />
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
    <div
      className={cn(
        "flex h-full select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs",
        className
      )}
      style={{ 
        borderColor: 'rgba(156, 163, 175, 0.2)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)'
      }}
    >
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
} 