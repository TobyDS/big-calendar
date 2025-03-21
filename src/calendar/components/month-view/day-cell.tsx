import { useMemo } from "react";
import { isToday, startOfDay } from "date-fns";

import { cn } from "@/utils/helpers/cn.helper";
import { EventBullet } from "@/calendar/components/month-view/event-bullet";
import { MonthEventBadge } from "@/calendar/components/month-view/month-event-badge";
import { MonthEventSkeleton } from "@/calendar/components/skeleton-loader";
import { getMonthCellEvents } from "@/calendar/helpers";
import type { ICalendarCell, IEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

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

  // Use date as seed to make skeleton positions deterministic 
  const shouldShowSkeleton = useMemo(() => {
    if (!isLoading || !currentMonth) return false;
    // Use the day number as deterministic value
    return date.getDate() % 3 === 0;
  }, [date, isLoading, currentMonth]);

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
                // Show skeleton while loading
                shouldShowSkeleton && position === 0 ? (
                  <>
                    <EventBullet className="lg:hidden opacity-50" color="blue" />
                    <MonthEventSkeleton className="hidden lg:flex" />
                  </>
                ) : null
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
