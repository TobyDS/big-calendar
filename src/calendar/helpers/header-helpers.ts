import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

import type { IEvent } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

// ================ Header helper functions ================ //

export function rangeText(view: TCalendarView, date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1) {
  const formatString = "MMM d, yyyy";
  let start: Date;
  let end: Date;

  switch (view) {
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "week":
      start = startOfWeek(date, { weekStartsOn });
      end = endOfWeek(date, { weekStartsOn });
      break;
    case "day":
      return format(date, formatString);
    default:
      return "Error while formatting ";
  }

  return `${format(start, formatString)} - ${format(end, formatString)}`;
}

export function navigateDate(date: Date, view: TCalendarView, direction: "previous" | "next"): Date {
  const operations = {
    month: direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
  };

  return operations[view](date, 1);
}

export function getEventsCount(
  events: IEvent[],
  date: Date,
  view: TCalendarView,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
  dayBoundaries?: { startHour: number; endHour: number }
): number {
  const compareFns = {
    day: isSameDay,
    week: (d1: Date, d2: Date) => isSameWeek(d1, d2, { weekStartsOn }),
    month: isSameMonth,
  };

  return events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    // First check if event is in the right time period (day/week/month)
    const isInPeriod = compareFns[view](eventStart, date);

    // If no day boundaries or not in day/week view, just return period check
    if (!dayBoundaries || view === "month") {
      return isInPeriod;
    }

    // For day/week views, check if event overlaps with visible hours
    const visibleStart = new Date(eventStart);
    visibleStart.setHours(dayBoundaries.startHour, 0, 0, 0);

    const visibleEnd = new Date(eventStart);
    visibleEnd.setHours(dayBoundaries.endHour, 0, 0, 0);

    return isInPeriod && eventStart < visibleEnd && eventEnd > visibleStart;
  }).length;
}
