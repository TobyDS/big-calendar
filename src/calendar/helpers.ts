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
  areIntervalsOverlapping,
} from "date-fns";

import type { TCalendarView } from "@/calendar/types";
import type { ICalendarCell, IEvent } from "@/calendar/interfaces";

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

  // Step 1: Group overlapping events
  const overlappingGroups: IEvent[][] = [];
  
  for (const event of sortedEvents) {
    const eventStart = parseISO(event.startDate);
    const eventEnd = parseISO(event.endDate);
    
    // Find if this event overlaps with any existing group
    let addedToGroup = false;
    for (const group of overlappingGroups) {
      // Check if event overlaps with any event in this group
      const overlapsWithGroup = group.some(groupEvent => 
        areIntervalsOverlapping(
          { start: eventStart, end: eventEnd },
          { start: parseISO(groupEvent.startDate), end: parseISO(groupEvent.endDate) }
        )
      );

      if (overlapsWithGroup) {
        group.push(event);
        addedToGroup = true;
        break;
      }
    }

    // If doesn't overlap with any group, create new group
    if (!addedToGroup) {
      overlappingGroups.push([event]);
    }
  }

  // Step 2: For each group, create minimal columns
  return overlappingGroups.map(group => {
    if (group.length === 1) {
      // Single event takes full width
      return {
        events: [{ event: group[0], column: 0 }],
        totalColumns: 1
      };
    }

    // For multiple events, find minimal column arrangement
    const eventColumns: { event: IEvent; column: number }[] = [];
    
    for (const event of group) {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      
      // Try each column until we find one where this event doesn't overlap
      // with any events already in that column
      let column = 0;
      let placed = false;
      
      while (!placed) {
        const eventsInColumn = eventColumns.filter(e => e.column === column);
        const overlapsWithColumn = eventsInColumn.some(({ event: columnEvent }) =>
          areIntervalsOverlapping(
            { start: eventStart, end: eventEnd },
            { start: parseISO(columnEvent.startDate), end: parseISO(columnEvent.endDate) }
          )
        );

        if (!overlapsWithColumn) {
          eventColumns.push({ event, column });
          placed = true;
        } else {
          column++;
        }
      }
    }

    // Calculate total columns needed for this group
    const totalColumns = Math.max(...eventColumns.map(e => e.column)) + 1;

    return {
      events: eventColumns,
      totalColumns
    };
  });
}

/** Get array of hours to display in the calendar */
export function getDisplayHours(dayBoundaries?: { startHour: number; endHour: number }) {
  // Default to showing full day (0-23) if no boundaries
  const start = dayBoundaries?.startHour ?? 0;
  const end = dayBoundaries?.endHour ?? 23;
  
  // Ensure valid range
  const validStart = Math.max(0, Math.min(start, 23));
  const validEnd = Math.max(validStart, Math.min(end, 23));
  
  return Array.from({ length: validEnd - validStart + 1 }, (_, i) => validStart + i);
}

/** Get total height of the calendar in pixels */
export function getCalendarHeight(dayBoundaries?: { startHour: number; endHour: number }) {
  const hours = getDisplayHours(dayBoundaries);
  return hours.length * CELL_HEIGHT_PX;
}

/** Get event block style with time boundary support */
export function getEventBlockStyle(
  event: IEvent,
  column: number,
  dayBoundaries: { startHour: number; endHour: number; } | null = null,
  totalColumns: number = 1
) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  
  // Default to showing full day (0-23) if no boundaries
  const startHour = dayBoundaries?.startHour ?? 0;
  const endHour = dayBoundaries?.endHour ?? 23;
  
  // Calculate minutes for the event and the day boundaries
  const eventStartMinutes = startDate.getHours() * MINUTES_IN_HOUR + startDate.getMinutes();
  const eventEndMinutes = endDate.getHours() * MINUTES_IN_HOUR + endDate.getMinutes();
  const visibleStartMinutes = startHour * MINUTES_IN_HOUR;
  const visibleEndMinutes = endHour * MINUTES_IN_HOUR + MINUTES_IN_HOUR; // Add one hour to include the full last hour
  
  // Calculate position and size
  const minuteHeight = CELL_HEIGHT_PX / MINUTES_IN_HOUR;
  
  // Calculate top position relative to the start of the visible range
  const top = (eventStartMinutes - visibleStartMinutes) * minuteHeight;
  
  // Calculate height based on event duration, clamped to visible range
  const clampedEndMinutes = Math.min(eventEndMinutes, visibleEndMinutes);
  const clampedStartMinutes = Math.max(eventStartMinutes, visibleStartMinutes);
  const height = (clampedEndMinutes - clampedStartMinutes) * minuteHeight;

  // Calculate width and left position
  const columnWidth = `${100 / totalColumns}%`;
  const leftPosition = `${(100 / totalColumns) * column}%`;

  return {
    top: Math.round(top) + "px",
    height: Math.round(Math.max(height, CELL_HEIGHT_PX / 2)) + "px", // Minimum height for visibility
    width: columnWidth,
    left: leftPosition,
    position: "absolute" as const,
  };
}

// ================ Month view helper functions ================ //


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
    return isSameDay(date, eventStart);
  });

  return eventsForDate
    .map(event => ({
      ...event,
      position: eventPositions[event.id] ?? -1,
    }))
    .sort((a, b) => a.position - b.position);
}

export function getCalendarCells(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): ICalendarCell[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn });
  const days = eachDayOfInterval({ start, end });

  return days.map(day => ({
    day: day.getDate(),
    currentMonth: isSameMonth(day, date),
    date: day,
  }));
}
