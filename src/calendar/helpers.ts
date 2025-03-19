import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";

import type { TCalendarView } from "@/calendar/types";
import type { ICalendarCell, IEvent } from "@/calendar/interfaces";
import { useCalendar } from "./contexts/calendar-context";

// Calendar Constants
/** Number of days in a week */
export const DAYS_IN_WEEK = 7;

/** Maximum number of events that can be stacked in the month view */
export const MAX_EVENT_STACK = 3;

/** Number of hours in a day */
export const HOURS_IN_DAY = 24;

/** Number of minutes in an hour */
export const MINUTES_IN_HOUR = 60;

/** Total number of minutes in a day */
export const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;

/** Height of a single time cell in pixels */
export const CELL_HEIGHT_PX = 96;

/** Half the height of a time cell in pixels */
export const HALF_CELL_HEIGHT_PX = CELL_HEIGHT_PX / 2;

/** Width of the time column in rem units */
export const TIME_COLUMN_WIDTH_REM = 18;

/** Duration threshold in minutes below which events switch to a compact layout */
export const COMPACT_EVENT_THRESHOLD_MINUTES = 35;

/** Minimum event duration in minutes required to display the event time */
export const MIN_DURATION_FOR_TIME_DISPLAY = 25;

/** Interval in milliseconds for updating the current time indicator */
export const UPDATE_INTERVAL_MS = 60 * 1000;

/** Height of the day view scroll area in pixels */
export const SCROLL_AREA_HEIGHT_DAY = 800;

/** Height of the week view scroll area in pixels */
export const SCROLL_AREA_HEIGHT_WEEK = 736;

/** Vertical padding in pixels subtracted from event block height calculations */
export const EVENT_VERTICAL_PADDING = 8;

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

export function getEventsCount(events: IEvent[], date: Date, view: TCalendarView, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): number {
  const compareFns = {
    day: isSameDay,
    week: (d1: Date, d2: Date) => isSameWeek(d1, d2, { weekStartsOn }),
    month: isSameMonth,
  };

  return events.filter(event => compareFns[view](new Date(event.startDate), date)).length;
}

// ================ Week and day view helper functions ================ //

export function groupEvents(dayEvents: IEvent[]) {
  const sortedEvents = dayEvents.sort((a, b) => {
    // First sort by start time
    const timeCompare = parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
    if (timeCompare !== 0) return timeCompare;
    // If start times are equal, sort by duration (longer events first)
    const aDuration = differenceInMinutes(parseISO(a.endDate), parseISO(a.startDate));
    const bDuration = differenceInMinutes(parseISO(b.endDate), parseISO(b.startDate));
    return bDuration - aDuration;
  });

  // Create columns that can contain multiple non-overlapping events
  const columns: Array<Array<{ event: IEvent; start: Date; end: Date }>> = [];

  for (const event of sortedEvents) {
    const eventStart = parseISO(event.startDate);
    const eventEnd = parseISO(event.endDate);
    let placed = false;

    // Try to find a column where this event can fit without overlapping
    for (const column of columns) {
      // Check if event can be placed in this column
      const canFitInColumn = column.every(slot => {
        // No overlap if current event ends before slot starts or starts after slot ends
        return eventEnd <= slot.start || eventStart >= slot.end;
      });

      if (canFitInColumn) {
        column.push({ event, start: eventStart, end: eventEnd });
        placed = true;
        break;
      }
    }

    // If event couldn't fit in any existing column, create a new one
    if (!placed) {
      columns.push([{ event, start: eventStart, end: eventEnd }]);
    }
  }

  // Convert columns back to groups format
  return columns.map(column => column.map(slot => slot.event));
}

export function getEventBlockStyle(
  event: IEvent,
  groupIndex: number,
  totalGroups: number,
  timeBoundaries: { startHour: number; endHour: number; } | null = null
) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const startHour = timeBoundaries?.startHour ?? 0;
  const endHour = timeBoundaries?.endHour ?? 23;

  // Clamp event times to boundaries
  const eventStartHour = Math.max(startDate.getHours(), startHour);
  const eventEndHour = Math.min(endDate.getHours(), endHour);
  const eventStartMinutes = eventStartHour * MINUTES_IN_HOUR + startDate.getMinutes();
  const eventEndMinutes = eventEndHour * MINUTES_IN_HOUR + endDate.getMinutes();
  const dayStartMinutes = startHour * MINUTES_IN_HOUR;

  const top = ((eventStartMinutes - dayStartMinutes) / MINUTES_IN_HOUR) * CELL_HEIGHT_PX + EVENT_VERTICAL_PADDING;
  const height = ((eventEndMinutes - eventStartMinutes) / MINUTES_IN_HOUR) * CELL_HEIGHT_PX - EVENT_VERTICAL_PADDING * 2;

  // Calculate width and left position based on group
  const baseWidth = totalGroups > 0 ? 95 / totalGroups : 95; // Leave small gap between events
  const baseLeft = totalGroups > 0 ? (groupIndex * 95) / totalGroups : 0;

  return {
    top: Math.round(top) + "px",
    height: Math.round(Math.max(height, CELL_HEIGHT_PX / 2)) + "px", // Ensure minimum height
    width: Math.round(baseWidth) + "%",
    left: Math.round(baseLeft) + "%",
  };
}

// ================ Month view helper functions ================ //

export function getCalendarCells(selectedDate: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): ICalendarCell[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return (firstDay + DAYS_IN_WEEK - weekStartsOn) % DAYS_IN_WEEK;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const nextMonthCells = Array.from({ length: (DAYS_IN_WEEK - (totalDays % DAYS_IN_WEEK)) % DAYS_IN_WEEK }, (_, i) => ({
    day: i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth + 1, i + 1),
  }));

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(singleDayEvents: IEvent[], selectedDate: Date) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const eventPositions: { [key: string]: number } = {};
  const occupiedPositions: { [key: string]: boolean[] } = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(day => {
    occupiedPositions[day.toISOString()] = Array(MAX_EVENT_STACK).fill(false);
  });

  const sortedEvents = [
    ...singleDayEvents.sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()),
  ];

  sortedEvents.forEach(event => {
    const eventStart = parseISO(event.startDate);
    const eventEnd = parseISO(event.endDate);
    const eventDays = eachDayOfInterval({
      start: eventStart < monthStart ? monthStart : eventStart,
      end: eventEnd > monthEnd ? monthEnd : eventEnd,
    });

    let position = -1;

    for (let i = 0; i < MAX_EVENT_STACK; i++) {
      if (
        eventDays.every(day => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
          return dayPositions && !dayPositions[i];
        })
      ) {
        position = i;
        break;
      }
    }

    if (position !== -1) {
      eventDays.forEach(day => {
        const dayKey = startOfDay(day).toISOString();
        occupiedPositions[dayKey][position] = true;
      });
      eventPositions[event.id] = position;
    }
  });

  return eventPositions;
}

export function getMonthCellEvents(date: Date, events: IEvent[], eventPositions: Record<string, number>) {
  const eventsForDate = events.filter(event => {
    const eventStart = parseISO(event.startDate);
    const eventEnd = parseISO(event.endDate);
    return (date >= eventStart && date <= eventEnd) || isSameDay(date, eventStart) || isSameDay(date, eventEnd);
  });

  return eventsForDate
    .map(event => ({
      ...event,
      position: eventPositions[event.id] ?? -1,
      isMultiDay: event.startDate !== event.endDate,
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1;
      if (!a.isMultiDay && b.isMultiDay) return 1;
      return a.position - b.position;
    });
}
