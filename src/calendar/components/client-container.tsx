"use client";

import { useEffect, useMemo } from "react";
import { isSameDay, parseISO } from "date-fns";
import { usePathname } from "next/navigation";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { CalendarHeader } from "@/calendar/components/header/calendar-header";
import { CalendarMonthView } from "@/calendar/components/month-view/calendar-month-view";
import { CalendarDayView } from "@/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/calendar/components/week-and-day-view/calendar-week-view";
import type { TCalendarView } from "@/calendar/types";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { useCalendarEvents } from "@/hooks/use-calendar-events";

interface IProps {
  view: TCalendarView;
}

export function ClientContainer({ view }: IProps) {
  const pathname = usePathname();
  const { selectedDate, selectedUserId, hasUsers, setCurrentView } = useCalendar();
  
  // Determine current view from props or pathname as backup
  const currentView = view || (pathname?.includes("/day-view") 
    ? "day" 
    : pathname?.includes("/month-view") 
      ? "month" 
      : "week");
  
  // Update the current view in context whenever it changes
  useEffect(() => {
    setCurrentView(currentView);
  }, [currentView, setCurrentView]);
  
  // Use our hook to fetch events dynamically - now always fetches month data
  const { events: filteredEvents, isLoading, prefetchAdjacent } = useCalendarEvents({
    selectedDate,
    view: currentView,
    selectedUserId,
    hasUsers
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
