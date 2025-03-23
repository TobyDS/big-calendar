"use client";

import { endOfMonth, endOfWeek, isSameDay, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { CalendarHeader } from "@/calendar/components/header/calendar-header";
import { CalendarMonthView } from "@/calendar/components/month-view/calendar-month-view";
import { CalendarDayView } from "@/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/calendar/components/week-and-day-view/calendar-week-view";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { TCalendarView } from "@/calendar/types";
import { useCalendarEvents } from "@/hooks/use-calendar-events";

export function ClientContainer({ view }: { view: TCalendarView }) {
  const pathname = usePathname();
  const { selectedDate, selectedUserId, hasUsers, setCurrentView, weekStartsOn } = useCalendar();

  // Determine current view from props or pathname as backup
  const currentView = view || (pathname?.includes("/day-view") ? "day" : pathname?.includes("/month-view") ? "month" : "week");

  // Update the current view in context whenever it changes
  useEffect(() => {
    setCurrentView(currentView);
  }, [currentView, setCurrentView]);

  // Calculate visible date range based on view
  const { visibleStart, visibleEnd } = useMemo(() => {
    if (currentView === "week") {
      return {
        visibleStart: startOfWeek(selectedDate, { weekStartsOn }),
        visibleEnd: endOfWeek(selectedDate, { weekStartsOn }),
      };
    } else if (currentView === "day") {
      // For day view, the visible range is just the selected day
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);

      return { visibleStart: dayStart, visibleEnd: dayEnd };
    } else {
      // For month view
      return {
        visibleStart: startOfMonth(selectedDate),
        visibleEnd: endOfMonth(selectedDate),
      };
    }
  }, [selectedDate, currentView, weekStartsOn]);

  // Use our hook to fetch events dynamically with the calculated visible range
  const {
    events: filteredEvents,
    isLoading,
    prefetchAdjacent,
  } = useCalendarEvents({
    selectedDate,
    selectedUserId,
    hasUsers,
    visibleStart,
    visibleEnd,
  });

  // When selected date changes, prefetch events for adjacent months
  useEffect(() => {
    prefetchAdjacent();
  }, [selectedDate, prefetchAdjacent]);

  // Filter events to get single day events
  const singleDayEvents = useMemo(() => {
    return filteredEvents.filter(event => {
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);
      return isSameDay(startDate, endDate);
    });
  }, [filteredEvents]);

  return (
    <div className="rounded-xl border">
      <CalendarHeader view={currentView} events={filteredEvents} />
      {/* Always render the calendar views to prevent layout shifts */}
      {currentView === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} isLoading={isLoading} />}
      {currentView === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} isLoading={isLoading} />}
      {currentView === "day" && <CalendarDayView singleDayEvents={singleDayEvents} isLoading={isLoading} />}
      <AddEventDialog />
      <EventDetailsDialog />
    </div>
  );
}
