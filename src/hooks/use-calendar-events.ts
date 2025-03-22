import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { useMemo, useCallback } from "react";

import { getEvents } from "@/calendar/requests";
import type { IDefaultEvent } from "@/calendar/interfaces";

interface UseCalendarEventsParams {
  selectedDate: Date;
  selectedUserId?: string | "all" | null;
  hasUsers?: boolean;
  view?: string;
}

// Query key factory pattern to solve React Query linting issues
// See: https://tanstack.com/query/latest/docs/react/guides/query-keys
const eventsKeys = {
  all: ["events"] as const,
  month: (dateRangeStart: number, dateRangeEnd: number) => 
    [...eventsKeys.all, "month", dateRangeStart, dateRangeEnd] as const,
};

export function useCalendarEvents({ selectedDate, selectedUserId, hasUsers }: UseCalendarEventsParams) {
  const queryClient = useQueryClient();
  
  // Always use month range for data fetching regardless of view
  const dateRange = useMemo(() => {
    return {
      start: startOfMonth(selectedDate),
      end: endOfMonth(selectedDate)
    };
  }, [selectedDate]);
  
  // Generate query key in a stable way
  const queryKey = useMemo(() => 
    eventsKeys.month(dateRange.start.getTime(), dateRange.end.getTime()), 
    [dateRange]
  );
  
  // Fetch events for the current month
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

  // Pre-fetch adjacent months
  const prefetchAdjacent = useCallback(() => {
    // Calculate adjacent months
    const nextMonth = addMonths(selectedDate, 1);
    const prevMonth = addMonths(selectedDate, -1);
    
    // Calculate ranges for adjacent months
    const nextRange = {
      start: startOfMonth(nextMonth),
      end: endOfMonth(nextMonth)
    };
    
    const prevRange = {
      start: startOfMonth(prevMonth),
      end: endOfMonth(prevMonth)
    };
    
    // Generate query keys for adjacent months
    const nextQueryKey = eventsKeys.month(nextRange.start.getTime(), nextRange.end.getTime());
    const prevQueryKey = eventsKeys.month(prevRange.start.getTime(), prevRange.end.getTime());
    
    // Prefetch the adjacent months
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
  }, [queryClient, selectedDate]);

  return {
    events: filteredEvents,
    isLoading,
    isError,
    prefetchAdjacent
  };
} 