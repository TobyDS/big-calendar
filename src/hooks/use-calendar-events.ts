import { useQueryClient, useQueries } from "@tanstack/react-query";
import { 
  endOfMonth, 
  addMonths, 
  isBefore, 
  isAfter, 
  isEqual
} from "date-fns";
import { useMemo, useCallback } from "react";

import { getEvents } from "@/calendar/api/events";
import type { IDefaultEvent } from "@/calendar/interfaces";

interface UseCalendarEventsParams {
  selectedDate: Date;
  selectedUserId?: string | "all" | null;
  hasUsers?: boolean;
  visibleStart: Date; // Start date visible in the UI - REQUIRED
  visibleEnd: Date;   // End date visible in the UI - REQUIRED
}

// Query key factory pattern
const eventsKeys = {
  all: ["events"] as const,
  month: (year: number, month: number) => 
    [...eventsKeys.all, "month", year, month] as const,
};

export function useCalendarEvents({ 
  selectedDate, 
  selectedUserId, 
  hasUsers, 
  visibleStart,
  visibleEnd
}: UseCalendarEventsParams) {  
  const queryClient = useQueryClient();
  
  // Determine which months we need data for based on the visible range
  const requiredMonths = useMemo(() => {
    const months = new Set<string>();
    
    // Always include the selected date's month
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    months.add(`${selectedYear}-${selectedMonth}`);
    
    // If we have visible range that spans multiple months, include those months too
    const startYear = visibleStart.getFullYear();
    const startMonth = visibleStart.getMonth();
    months.add(`${startYear}-${startMonth}`);
    
    const endYear = visibleEnd.getFullYear();
    const endMonth = visibleEnd.getMonth();
    months.add(`${endYear}-${endMonth}`);
    
    // If start and end are in different months, check if there are months in between
    if (`${startYear}-${startMonth}` !== `${endYear}-${endMonth}`) {
      // Simple case: if they're in the same year, add all months in between
      if (startYear === endYear) {
        for (let m = startMonth + 1; m < endMonth; m++) {
          months.add(`${startYear}-${m}`);
        }
      } else {
        // Complex case: different years
        // Add remaining months of start year
        for (let m = startMonth + 1; m < 12; m++) {
          months.add(`${startYear}-${m}`);
        }
        
        // Add months from years in between
        for (let y = startYear + 1; y < endYear; y++) {
          for (let m = 0; m < 12; m++) {
            months.add(`${y}-${m}`);
          }
        }
        
        // Add beginning months of end year
        for (let m = 0; m < endMonth; m++) {
          months.add(`${endYear}-${m}`);
        }
      }
    }
    
    return Array.from(months).map(key => {
      const [year, month] = key.split('-').map(Number);
      return { year, month };
    });
  }, [selectedDate, visibleStart, visibleEnd]);
  
  // Fetch all required months in parallel
  const monthQueries = useQueries({
    queries: requiredMonths.map(({ year, month }) => {
      const start = new Date(year, month, 1);
      const end = endOfMonth(start);
      
      return {
        queryKey: eventsKeys.month(year, month),
        queryFn: () => getEvents(start, end),
        staleTime: 5 * 60 * 1000,
        enabled: true
      };
    })
  });
  
  // Get all events for required months
  const allEvents = useMemo(() => {
    let events: IDefaultEvent[] = [];
    let hasAllData = true;
    
    // First check if data is already in the cache for each required month
    requiredMonths.forEach(({ year, month }) => {
      const queryKey = eventsKeys.month(year, month);
      const cachedData = queryClient.getQueryData<IDefaultEvent[]>(queryKey);
      
      if (cachedData) {
        events = [...events, ...cachedData];
      } else {
        hasAllData = false;
      }
    });
    
    // If all needed data was in cache, return it
    if (hasAllData) {
      return events;
    }
    
    // Otherwise, combine data from active queries
    const activeQueryData = monthQueries
      .filter(query => query.data)
      .flatMap(query => query.data || []);
    
    // Prioritize query data over cached data, but include both
    const combinedEvents = [...activeQueryData];
    
    // Use a Set for deduplication
    const eventIds = new Set(combinedEvents.map(event => event.id));
    
    // Add events from cache that aren't in active query results
    events.forEach(event => {
      if (!eventIds.has(event.id)) {
        combinedEvents.push(event);
        eventIds.add(event.id);
      }
    });
    
    return combinedEvents;
  }, [requiredMonths, monthQueries, queryClient]);
  
  // Filter events for the visible range and selected user
  const visibleEvents = useMemo(() => {
    return allEvents.filter((event: IDefaultEvent) => {
      // Check if event is within the visible date range
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // An event overlaps with the visible range if:
      // 1. The event starts within the visible range
      // 2. The event ends within the visible range
      // 3. The event starts before and ends after the visible range (spanning it completely)
      const dateOverlap = 
        ((isEqual(eventStart, visibleStart) || isAfter(eventStart, visibleStart)) && 
         (isEqual(eventStart, visibleEnd) || isBefore(eventStart, visibleEnd))) ||
        ((isEqual(eventEnd, visibleStart) || isAfter(eventEnd, visibleStart)) && 
         (isEqual(eventEnd, visibleEnd) || isBefore(eventEnd, visibleEnd))) ||
        (isBefore(eventStart, visibleStart) && isAfter(eventEnd, visibleEnd));
      
      // Check user match if needed
      const isUserMatch = !hasUsers || selectedUserId === "all" || (event.user && event.user.id === selectedUserId);
      
      return dateOverlap && isUserMatch;
    });
  }, [allEvents, visibleStart, visibleEnd, hasUsers, selectedUserId]);
  
  // Pre-fetch adjacent months
  const prefetchAdjacent = useCallback(() => {
    const nextMonth = addMonths(selectedDate, 1);
    const prevMonth = addMonths(selectedDate, -1);
    
    const nextYear = nextMonth.getFullYear();
    const nextMonthNum = nextMonth.getMonth();
    const prevYear = prevMonth.getFullYear();
    const prevMonthNum = prevMonth.getMonth();
    
    // Prefetch next month
    queryClient.prefetchQuery({
      queryKey: eventsKeys.month(nextYear, nextMonthNum),
      queryFn: () => getEvents(
        new Date(nextYear, nextMonthNum, 1),
        endOfMonth(new Date(nextYear, nextMonthNum, 1))
      ),
      staleTime: 5 * 60 * 1000,
    });
    
    // Prefetch previous month
    queryClient.prefetchQuery({
      queryKey: eventsKeys.month(prevYear, prevMonthNum),
      queryFn: () => getEvents(
        new Date(prevYear, prevMonthNum, 1),
        endOfMonth(new Date(prevYear, prevMonthNum, 1))
      ),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, selectedDate]);

  // Calculate overall loading state
  const isLoading = monthQueries.some(query => query.isLoading) && 
                  requiredMonths.some(({ year, month }) => {
                    const queryKey = eventsKeys.month(year, month);
                    return !queryClient.getQueryData(queryKey);
                  });
  
  // Calculate overall error state
  const isError = monthQueries.some(query => query.isError);

  return {
    events: visibleEvents,
    isLoading,
    isError,
    prefetchAdjacent
  };
} 