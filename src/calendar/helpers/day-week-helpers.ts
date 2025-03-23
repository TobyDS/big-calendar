import { areIntervalsOverlapping, differenceInMinutes, parseISO } from "date-fns";

import { CELL_HEIGHT_PX, MINUTES_IN_HOUR } from "@/calendar/helpers/constants";
import type { IEvent } from "@/calendar/interfaces";

// Minimum height for event blocks to ensure they remain visible and clickable
const MIN_EVENT_BLOCK_HEIGHT_PX = CELL_HEIGHT_PX / 2;

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
        areIntervalsOverlapping({ start: eventStart, end: eventEnd }, { start: parseISO(groupEvent.startDate), end: parseISO(groupEvent.endDate) })
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
        totalColumns: 1,
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
          areIntervalsOverlapping({ start: eventStart, end: eventEnd }, { start: parseISO(columnEvent.startDate), end: parseISO(columnEvent.endDate) })
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
      totalColumns,
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

  // Create array from start hour up to (but not including) end hour
  return Array.from({ length: validEnd - validStart }, (_, i) => validStart + i);
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
  dayBoundaries: { startHour: number; endHour: number } | null = null,
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
  const visibleEndMinutes = endHour * MINUTES_IN_HOUR; // Stop exactly at the end hour

  // Calculate position and size
  const minuteHeight = CELL_HEIGHT_PX / MINUTES_IN_HOUR;

  // Calculate top position relative to the start of the visible range
  const top = (eventStartMinutes - visibleStartMinutes) * minuteHeight;

  // Calculate height based on event duration, clamped to visible range
  const clampedEndMinutes = Math.min(eventEndMinutes, visibleEndMinutes);
  const clampedStartMinutes = Math.max(eventStartMinutes, visibleStartMinutes);
  const calculatedEventHeight = (clampedEndMinutes - clampedStartMinutes) * minuteHeight;

  // Calculate width and left position
  const columnWidth = `${100 / totalColumns}%`;
  const leftPosition = `${(100 / totalColumns) * column}%`;

  return {
    top: Math.round(top) + "px",
    height: Math.round(Math.max(calculatedEventHeight, MIN_EVENT_BLOCK_HEIGHT_PX)) + "px",
    width: columnWidth,
    left: leftPosition,
    position: "absolute" as const,
  };
}
