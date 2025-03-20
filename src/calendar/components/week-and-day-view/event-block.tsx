import { cva } from "class-variance-authority";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { CELL_HEIGHT_PX, EVENT_VERTICAL_PADDING, COMPACT_EVENT_THRESHOLD_MINUTES, MINUTES_IN_HOUR, MIN_DURATION_FOR_TIME_DISPLAY } from "@/calendar/helpers";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";

import { cn } from "@/utils/helpers/cn.helper";

import type { HTMLAttributes } from "react";
import type { IEvent } from "@/calendar/interfaces";
import type { VariantProps } from "class-variance-authority";

const calendarWeekEventCardVariants = cva(
  "flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-offset-2 transition-colors duration-200",
  {
    variants: {
      color: {
        // Colored variants
        blue: "border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:border-blue-400/20 dark:bg-blue-400/10 dark:hover:bg-blue-400/20 dark:text-blue-400",
        indigo: "border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:hover:bg-indigo-400/20 dark:text-indigo-400",
        pink: "border-pink-500/20 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 dark:border-pink-400/20 dark:bg-pink-400/10 dark:hover:bg-pink-400/20 dark:text-pink-400",
        red: "border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:border-red-400/20 dark:bg-red-400/10 dark:hover:bg-red-400/20 dark:text-red-400",
        orange: "border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:border-orange-400/20 dark:bg-orange-400/10 dark:hover:bg-orange-400/20 dark:text-orange-400",
        amber: "border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:border-amber-400/20 dark:bg-amber-400/10 dark:hover:bg-amber-400/20 dark:text-amber-400",
        emerald: "border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/20 dark:text-emerald-400",

        // Dot variants
        "blue-dot": "border-b-primary bg-bg-secondary text-t-primary [&_svg]:fill-blue-500 dark:[&_svg]:fill-blue-400",
        "indigo-dot": "border-b-primary bg-bg-secondary text-t-primary [&_svg]:fill-indigo-500 dark:[&_svg]:fill-indigo-400",
        "pink-dot": "border-b-primary bg-bg-secondary text-t-primary [&_svg]:fill-pink-500 dark:[&_svg]:fill-pink-400",
        "red-dot": "border-b-primary bg-bg-secondary text-t-primary [&_svg]:fill-red-500 dark:[&_svg]:fill-red-400",
        "orange-dot": "border-b-primary bg-bg-secondary text-t-primary [&_svg]:fill-orange-500 dark:[&_svg]:fill-orange-400",
        "amber-dot": "border-b-primary bg-bg-secondary text-t-primary [&_svg]:fill-amber-500 dark:[&_svg]:fill-amber-400",
        "emerald-dot": "border-b-primary bg-bg-secondary text-t-primary [&_svg]:fill-emerald-500 dark:[&_svg]:fill-emerald-400",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  }
);

interface IProps extends HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof calendarWeekEventCardVariants>, "color"> {
  event: IEvent;
}

export function EventBlock({ event, className }: IProps) {
  const { badgeVariant, openEventDetailsDialog } = useCalendar();

  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const durationInMinutes = differenceInMinutes(end, start);
  const heightInPixels = (durationInMinutes / MINUTES_IN_HOUR) * CELL_HEIGHT_PX - EVENT_VERTICAL_PADDING;

  const color = (badgeVariant === "dot" ? `${event.color}-dot` : event.color) as VariantProps<typeof calendarWeekEventCardVariants>["color"];
  const calendarWeekEventCardClasses = cn(calendarWeekEventCardVariants({ color, className }), durationInMinutes < COMPACT_EVENT_THRESHOLD_MINUTES && "py-0 justify-center");

  return (
    <div 
      role="button" 
      tabIndex={0} 
      className={calendarWeekEventCardClasses} 
      style={{ height: `${heightInPixels}px` }}
      onClick={() => openEventDetailsDialog(event)}
    >
      <div className="flex items-center gap-1.5 truncate">
        {badgeVariant === "dot" && (
          <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
            <circle cx="4" cy="4" r="4" />
          </svg>
        )}

        <p className="truncate font-semibold">{event.title}</p>
      </div>

      {durationInMinutes > MIN_DURATION_FOR_TIME_DISPLAY && (
        <p>
          {format(start, "HH:mm a")} - {format(end, "HH:mm a")}
        </p>
      )}
    </div>
  );
}
