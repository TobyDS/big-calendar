import { useMemo } from "react";
import { isToday, startOfDay } from "date-fns";

import { cn } from "@/utils/helpers/cn.helper";
import { EventBullet } from "@/calendar/components/month-view/event-bullet";
import { MonthEventBadge } from "@/calendar/components/month-view/month-event-badge";
import { MonthEventSkeleton } from "@/calendar/components/skeleton";
import { getMonthCellEvents } from "@/calendar/helpers";
import { SKELETON_MONTH_EVENTS } from "@/calendar/helpers/skeleton-events";
import type { ICalendarCell, IEvent } from "@/calendar/interfaces";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
  isLoading?: boolean;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions, isLoading = false }: IProps) {
  const { day, currentMonth, date } = cell;

  const cellEvents = useMemo(() => getMonthCellEvents(date, events, eventPositions), [date, events, eventPositions]);

  // Get skeleton configuration for this day
  const skeletonConfig = useMemo(() => {
    if (!isLoading || !currentMonth) return null;
    return SKELETON_MONTH_EVENTS[date.getDate()];
  }, [date, isLoading, currentMonth]);

  // Calculate how many skeleton events to show
  const skeletonCount = skeletonConfig?.count || 0;

  return (
    <div className="flex flex-col gap-1 py-1.5 lg:py-2">
      <span
        className={cn(
          "h-6 px-1 text-xs font-semibold lg:px-2",
          !currentMonth && "opacity-20",
          isToday(date) && "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary-600 px-0 font-bold text-white"
        )}
      >
        {day}
      </span>

      <div className={cn("flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0", !currentMonth && "opacity-50")}>
        {[0, 1, 2].map(position => {
          const event = cellEvents.find(e => e.position === position);
          const eventKey = event ? `event-${event.id}-${position}` : `empty-${position}`;

          return (
            <div key={eventKey} className="lg:flex-1">
              {isLoading ? (
                // Always show skeletons from top to bottom
                position < skeletonCount && (
                  <>
                    <EventBullet className="opacity-50 lg:hidden" color="blue" />
                    <MonthEventSkeleton className="hidden lg:flex" />
                  </>
                )
              ) : (
                // Show actual event when loaded
                event && (
                  <>
                    <EventBullet className="lg:hidden" color={event.color} />
                    <MonthEventBadge className="hidden lg:flex" event={event} cellDate={startOfDay(date)} />
                  </>
                )
              )}
            </div>
          );
        })}
      </div>

      {!isLoading && cellEvents.length > MAX_VISIBLE_EVENTS && (
        <p className={cn("h-4.5 px-1.5 text-xs font-semibold text-t-quaternary", !currentMonth && "opacity-50")}>
          <span className="sm:hidden">+{cellEvents.length - MAX_VISIBLE_EVENTS}</span>
          <span className="hidden sm:inline"> {cellEvents.length - MAX_VISIBLE_EVENTS} more...</span>
        </p>
      )}
    </div>
  );
}
