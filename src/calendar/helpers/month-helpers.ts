import { eachDayOfInterval, endOfMonth, endOfWeek, isSameDay, isSameMonth, parseISO, startOfDay, startOfMonth, startOfWeek } from "date-fns";

import { MAX_EVENT_STACK } from "@/calendar/helpers/constants";
import type { ICalendarCell, IEvent } from "@/calendar/interfaces";

// ================ Month view helper functions ================ //

export function calculateMonthEventPositions(singleDayEvents: IEvent[], selectedDate: Date) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const eventPositions: { [key: string]: number } = {};
  const occupiedPositions: { [key: string]: boolean[] } = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(day => {
    occupiedPositions[day.toISOString()] = Array(MAX_EVENT_STACK).fill(false);
  });

  const sortedEvents = [...singleDayEvents.sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())];

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
