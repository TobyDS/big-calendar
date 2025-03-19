import { useMemo } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { DayCell } from "@/calendar/components/month-view/day-cell";
import { getCalendarCells, calculateMonthEventPositions } from "@/calendar/helpers";
import { cn } from "@/utils/helpers/cn.helper";
import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ singleDayEvents }: IProps) {
  const { selectedDate, weekStartsOn } = useCalendar();

  const weekDays = useMemo(() => {
    const days = [...WEEK_DAYS];
    return [...days.slice(weekStartsOn), ...days.slice(0, weekStartsOn)];
  }, [weekStartsOn]);

  const allEvents = [...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate, weekStartsOn), [selectedDate, weekStartsOn]);

  const eventPositions = useMemo(() => calculateMonthEventPositions(singleDayEvents, selectedDate), [singleDayEvents, selectedDate]);

  return (
    <div>
      {/* Header row */}
      <div className="grid grid-cols-7">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={cn(
              "flex items-center justify-center py-2",
              index > 0 && "border-l"
            )}
          >
            <span className="text-xs font-medium text-t-quaternary">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          const isFirstColumn = index % 7 === 0;
          return (
            <div 
              key={cell.date.toISOString()} 
              className={cn(
                "relative border-t",
                !isFirstColumn && "border-l"
              )}
            >
              <DayCell cell={cell} events={allEvents} eventPositions={eventPositions} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
