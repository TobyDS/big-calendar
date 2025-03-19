import { useMemo } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { DayCell } from "@/calendar/components/month-view/day-cell";
import { getCalendarCells, calculateMonthEventPositions } from "@/calendar/helpers";
import type { IEvent } from "@/calendar/interfaces";
interface IProps {
  singleDayEvents: IEvent[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ singleDayEvents }: IProps) {
  const { selectedDate } = useCalendar();

  const allEvents = [...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(() => calculateMonthEventPositions(singleDayEvents, selectedDate), [singleDayEvents, selectedDate]);

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map(day => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-t-quaternary">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map(cell => (
          <DayCell key={cell.date.toISOString()} cell={cell} events={allEvents} eventPositions={eventPositions} />
        ))}
      </div>
    </div>
  );
}
