import { cn } from "@/utils/helpers/cn.helper";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md", className)}
      style={{
        backgroundColor: "rgba(156, 163, 175, 0.5)",
      }}
    />
  );
}
