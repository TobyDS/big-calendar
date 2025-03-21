import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, addMonths, addWeeks, addDays } from "date-fns";
import { useMemo, useCallback } from "react";

import { getEvents } from "@/calendar/requests";
import type { IDefaultEvent } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";

interface UseCalendarEventsParams {
  selectedDate: Date;
  view: TCalendarView;
  selectedUserId?: string | "all" | null;
  hasUsers?: boolean;
}

// Query key factory pattern to solve React Query linting issues
// See: https://tanstack.com/query/latest/docs/react/guides/query-keys
const eventsKeys = {
  all: ["events"] as const,
  dateRange: (view: TCalendarView, dateRangeStart: number, dateRangeEnd: number) => 
    [...eventsKeys.all, view, dateRangeStart, dateRangeEnd] as const,
};

export function useCalendarEvents({ selectedDate, view, selectedUserId, hasUsers }: UseCalendarEventsParams) {
  const queryClient = useQueryClient();
  
  // Calculate date range based on view and date
  const dateRange = useMemo(() => {
    switch (view) {
      case "month":
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        };
      case "week":
        return {
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate)
        };
      case "day":
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        };
      default:
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        };
    }
  }, [selectedDate, view]);
  
  // Generate query key in a stable way
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryKey = useMemo(() => 
    eventsKeys.dateRange(view, dateRange.start.getTime(), dateRange.end.getTime()), 
    [view, dateRange]
  );
  
  // Fetch events for the current date range
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => getEvents(dateRange.start, dateRange.end),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter events based on selected user
  const filteredEvents = useMemo(() => {
    return events.filter((event: IDefaultEvent) => {
      const isUserMatch = !hasUsers || selectedUserId === "all" || (event.user && event.user.id === selectedUserId);
      return isUserMatch;
    });
  }, [events, hasUsers, selectedUserId]);

  // Pre-fetch adjacent periods
  const prefetchAdjacent = useCallback(() => {
    // Calculate adjacent dates
    const nextDate = 
      view === "month" ? addMonths(selectedDate, 1) : 
      view === "week" ? addWeeks(selectedDate, 1) : 
      addDays(selectedDate, 1);
      
    const prevDate = 
      view === "month" ? addMonths(selectedDate, -1) : 
      view === "week" ? addWeeks(selectedDate, -1) : 
      addDays(selectedDate, -1);
    
    // Calculate ranges for adjacent periods
    const nextRange = {
      start: view === "month" ? startOfMonth(nextDate) : 
             view === "week" ? startOfWeek(nextDate) : 
             startOfDay(nextDate),
      end: view === "month" ? endOfMonth(nextDate) : 
           view === "week" ? endOfWeek(nextDate) : 
           endOfDay(nextDate)
    };
    
    const prevRange = {
      start: view === "month" ? startOfMonth(prevDate) : 
             view === "week" ? startOfWeek(prevDate) : 
             startOfDay(prevDate),
      end: view === "month" ? endOfMonth(prevDate) : 
           view === "week" ? endOfWeek(prevDate) : 
           endOfDay(prevDate)
    };
    
    // Generate query keys for adjacent periods
    const nextQueryKey = eventsKeys.dateRange(view, nextRange.start.getTime(), nextRange.end.getTime());
    const prevQueryKey = eventsKeys.dateRange(view, prevRange.start.getTime(), prevRange.end.getTime());
    
    // Prefetch the adjacent periods
    queryClient.prefetchQuery({
      queryKey: nextQueryKey,
      queryFn: () => getEvents(nextRange.start, nextRange.end),
      staleTime: 5 * 60 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: prevQueryKey,
      queryFn: () => getEvents(prevRange.start, prevRange.end),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, selectedDate, view]);

  return {
    events: filteredEvents,
    isLoading,
    isError,
    prefetchAdjacent
  };
} 