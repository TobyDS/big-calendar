"use client";

import { useEffect, useMemo } from "react";
import { isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { CalendarHeader } from "@/calendar/components/header/calendar-header";
import { CalendarMonthView } from "@/calendar/components/month-view/calendar-month-view";
import { CalendarDayView } from "@/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/calendar/components/week-and-day-view/calendar-week-view";
import type { TCalendarView } from "@/calendar/types";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { EventDetailsDialog } from "@/calendar/components/dialogs/event-details-dialog";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { getEvents } from "@/calendar/requests";

interface IProps {
  view: TCalendarView;
}

export function ClientContainer({ view }: IProps) {
  const pathname = usePathname();
  const { selectedDate, selectedUserId, hasUsers, setCurrentView } = useCalendar();
  const queryClient = useQueryClient();
  
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
  
  // Use our hook to fetch events dynamically
  const { events: filteredEvents, isLoading, prefetchAdjacent } = useCalendarEvents({
    selectedDate,
    view: currentView,
    selectedUserId,
    hasUsers
  });

  // Always prefetch month data on initial load
  useEffect(() => {
    const prefetchMonthData = async () => {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      
      // Only prefetch if we're not already in month view
      if (currentView !== "month") {
        await queryClient.prefetchQuery({
          queryKey: ["events", "month", monthStart.getTime(), monthEnd.getTime()],
          queryFn: () => getEvents(monthStart, monthEnd),
          staleTime: 5 * 60 * 1000,
        });
      }
    };
    
    prefetchMonthData();
  }, [selectedDate, currentView, queryClient]);

  // When selected date changes, prefetch events for adjacent periods
  useEffect(() => {
    // Prefetch adjacent periods when the component mounts or when date/view changes
    prefetchAdjacent();
  }, [selectedDate, currentView]); // Removed prefetchAdjacent from dependencies to avoid re-runs
  
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
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse text-lg">Loading events...</div>
        </div>
      ) : (
        <>
          {currentView === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} />}
          {currentView === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} />}
          {currentView === "day" && <CalendarDayView singleDayEvents={singleDayEvents} />}
        </>
      )}
      <AddEventDialog />
      <EventDetailsDialog />
    </div>
  );
}
