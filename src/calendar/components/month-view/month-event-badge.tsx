import { cva , type VariantProps} from "class-variance-authority";
import { endOfDay, format, isSameDay, parseISO, startOfDay } from "date-fns";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { cn } from "@/utils/helpers/cn.helper";
import type { IEvent } from "@/calendar/interfaces";

const eventBadgeVariants = cva(
  "mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs transition-colors duration-200",
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
      multiDayPosition: {
        first: "relative z-10 mr-0 w-[calc(100%_+_1px)] rounded-r-none border-r-0 [&>span]:mr-2.5",
        middle: "relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
        last: "ml-0 rounded-l-none border-l-0",
        none: "",
      },
    },
    defaultVariants: {
      color: "blue-dot",
    },
  }
);

interface IProps extends Omit<VariantProps<typeof eventBadgeVariants>, "color"> {
  event: IEvent;
  cellDate: Date;
  eventCurrentDay?: number;
  eventTotalDays?: number;
  className?: string;
  position?: "first" | "middle" | "last" | "none";
}

export function MonthEventBadge({ event, cellDate, eventCurrentDay, eventTotalDays, className, position: propPosition }: IProps) {
  const { badgeVariant } = useCalendar();

  const itemStart = startOfDay(parseISO(event.startDate));
  const itemEnd = endOfDay(parseISO(event.endDate));

  if (cellDate < itemStart || cellDate > itemEnd) return null;

  let position: "first" | "middle" | "last" | "none" | undefined;

  if (propPosition) {
    position = propPosition;
  } else if (eventCurrentDay && eventTotalDays) {
    position = "none";
  } else if (isSameDay(itemStart, itemEnd)) {
    position = "none";
  } else if (isSameDay(cellDate, itemStart)) {
    position = "first";
  } else if (isSameDay(cellDate, itemEnd)) {
    position = "last";
  } else {
    position = "middle";
  }

  const renderBadgeText = ["first", "none"].includes(position);

  const color = (badgeVariant === "dot" ? `${event.color}-dot` : event.color) as VariantProps<typeof eventBadgeVariants>["color"];

  const eventBadgeClasses = cn(eventBadgeVariants({ color, multiDayPosition: position, className }));

  return (
    <EventDetailsDialog event={event}>
      <div role="button" tabIndex={0} className={eventBadgeClasses}>
        <div className="flex items-center gap-1.5 truncate">
          {!["middle", "last"].includes(position) && badgeVariant === "dot" && (
            <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
              <circle cx="4" cy="4" r="4" />
            </svg>
          )}

          {renderBadgeText && (
            <p className="flex-1 truncate font-semibold">
              {eventCurrentDay && (
                <span className="text-xs">
                  Day {eventCurrentDay} of {eventTotalDays} •{" "}
                </span>
              )}
              {event.title}
            </p>
          )}
        </div>

        {renderBadgeText && <span>{format(new Date(event.startDate), "HH:mm")}</span>}
      </div>
    </EventDetailsDialog>
  );
}
