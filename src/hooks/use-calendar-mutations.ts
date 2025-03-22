import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";

import { createEvent, updateEvent, deleteEvent } from "@/calendar/api/events";
import type { IDefaultEvent } from "@/calendar/interfaces";
import type { TEventFormData } from "@/calendar/schemas";

// Query key factory pattern from useCalendarEvents
const eventsKeys = {
  all: ["events"] as const,
  month: (dateRangeStart: number, dateRangeEnd: number) => 
    [...eventsKeys.all, "month", dateRangeStart, dateRangeEnd] as const,
};

interface EventMutationOptions {
  onSuccess?: () => void;
}

// Helper to convert from form data to API format
function formatEventForApi(values: TEventFormData, userId?: string): Omit<IDefaultEvent, "id"> {
  // Combine date and time into ISO strings
  const startDateTime = new Date(values.startDate);
  startDateTime.setHours(values.startTime.hour, values.startTime.minute);
  
  const endDateTime = new Date(values.endDate);
  endDateTime.setHours(values.endTime.hour, values.endTime.minute);
  
  return {
    title: values.title,
    description: values.description || "",
    startDate: startDateTime.toISOString(),
    endDate: endDateTime.toISOString(),
    color: values.variant,
    user: userId ? { id: userId, name: "", picturePath: null } : undefined
  };
}

export function useCreateEvent({ onSuccess }: EventMutationOptions = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (values: TEventFormData & { userId?: string }) => {
      const eventData = formatEventForApi(values, values.userId);
      return createEvent(eventData);
    },
    onSuccess: (newEvent) => {
      // Get the month range for the new event to invalidate
      const eventDate = new Date(newEvent.startDate);
      const monthStart = startOfMonth(eventDate);
      const monthEnd = endOfMonth(eventDate);
      
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: eventsKeys.month(monthStart.getTime(), monthEnd.getTime()),
      });
      
      // Call optional onSuccess callback
      if (onSuccess) onSuccess();
    }
  });
}

export function useUpdateEvent({ onSuccess }: EventMutationOptions = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...values }: TEventFormData & { id: string; userId?: string }) => {
      const eventData = formatEventForApi(values, values.userId);
      return updateEvent(id, eventData);
    },
    onSuccess: (updatedEvent) => {
      // Get the month range for the updated event to invalidate
      const eventDate = new Date(updatedEvent.startDate);
      const monthStart = startOfMonth(eventDate);
      const monthEnd = endOfMonth(eventDate);
      
      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: eventsKeys.month(monthStart.getTime(), monthEnd.getTime()),
      });
      
      // Call optional onSuccess callback
      if (onSuccess) onSuccess();
    }
  });
}

export function useDeleteEvent({ onSuccess }: EventMutationOptions = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventId: string) => {
      return deleteEvent(eventId);
    },
    onSuccess: () => {
      // Since we don't know which month the event was in, invalidate all
      queryClient.invalidateQueries({
        queryKey: eventsKeys.all,
      });
      
      // Call optional onSuccess callback
      if (onSuccess) onSuccess();
    }
  });
} 