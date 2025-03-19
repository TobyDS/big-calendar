import { cva } from "class-variance-authority";

import { cn } from "@/utils/helpers/cn.helper";
import type { TEventColor } from "@/calendar/types";

const eventBulletVariants = cva("size-2 rounded-full", {
  variants: {
    color: {
      blue: "bg-blue-500 dark:bg-blue-400",
      indigo: "bg-indigo-500 dark:bg-indigo-400",
      pink: "bg-pink-500 dark:bg-pink-400",
      red: "bg-red-500 dark:bg-red-400",
      orange: "bg-orange-500 dark:bg-orange-400",
      amber: "bg-amber-500 dark:bg-amber-400",
      emerald: "bg-emerald-500 dark:bg-emerald-400",
    },
  },
  defaultVariants: {
    color: "blue",
  },
});

export function EventBullet({ color, className }: { color: TEventColor; className: string }) {
  return <div className={cn(eventBulletVariants({ color, className }))} />;
}
