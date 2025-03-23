import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";

import { createEvent, deleteEvent, updateEvent } from "@/calendar/api/events";
import type { IDefaultEvent } from "@/calendar/interfaces";
import type { TEventFormData } from "@/calendar/schemas";

// Query key factory pattern from useCalendarEvents
const eventsKeys = {
  all: ["events"] as const,
  month: (dateRangeStart: number, dateRangeEnd: number) => [...eventsKeys.all, "month", dateRangeStart, dateRangeEnd] as const,
};

interface EventMutationOptions {
  onSuccess?: () => void;
}

// Helper to convert from form data to API format
function formatEventForApi(values: TEventFormData & { userId?: string }, userId?: string): Omit<IDefaultEvent, "id"> {
  // Combine date and time into ISO strings
  const startDateTime = new Date(values.startDate);
  startDateTime.setHours(values.startTime.hour, values.startTime.minute);

  const endDateTime = new Date(values.endDate);
  endDateTime.setHours(values.endTime.hour, values.endTime.minute);

  // If userId is 'none', treat it as undefined
  const effectiveUserId = userId === "none" ? undefined : userId;

  return {
    title: values.title,
    description: values.description || "",
    startDate: startDateTime.toISOString(),
    endDate: endDateTime.toISOString(),
    color: values.variant,
    user: effectiveUserId ? { id: effectiveUserId, name: "", picturePath: null } : undefined,
  };
}

export function useCreateEvent({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TEventFormData & { userId?: string }) => {
      const userId = values.userId === "none" ? undefined : values.userId;
      const eventData = formatEventForApi(values, userId);
      return createEvent(eventData);
    },
    onMutate: async newEventData => {
      // Format data for optimistic update
      const userId = newEventData.userId === "none" ? undefined : newEventData.userId;
      const eventData = formatEventForApi(newEventData, userId);
      const optimisticEvent = {
        ...eventData,
        id: `temp-${Date.now()}`, // Temporary ID that will be replaced
        user: userId
          ? {
              id: userId,
              name: "Loading...", // This will be replaced with actual data
              picturePath: null,
            }
          : undefined,
      };

      // Get the month for this event
      const startDate = new Date(optimisticEvent.startDate);
      const monthStart = startOfMonth(startDate);
      const monthEnd = endOfMonth(startDate);
      const queryKey = eventsKeys.month(monthStart.getTime(), monthEnd.getTime());

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(queryKey) || [];

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: IDefaultEvent[] = []) => {
        return [...old, optimisticEvent];
      });

      return { previousEvents, queryKey };
    },
    onError: (_err, _newEvent, context) => {
      if (context) {
        // If there's an error, roll back to the previous value
        queryClient.setQueryData(context.queryKey, context.previousEvents);
      }
    },
    onSuccess: newEvent => {
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
    },
  });
}

export function useUpdateEvent({ onSuccess }: EventMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...values }: TEventFormData & { id: string; userId?: string }) => {
      const userId = values.userId === "none" ? undefined : values.userId;
      const eventData = formatEventForApi(values, userId);
      return updateEvent(id, eventData);
    },
    onMutate: async ({ id, ...values }) => {
      // Format data for optimistic update
      const userId = values.userId === "none" ? undefined : values.userId;
      const eventData = formatEventForApi(values, userId);
      const optimisticEvent = {
        ...eventData,
        id,
        user: userId
          ? {
              id: userId,
              name: "Loading...", // This will be replaced with actual data
              picturePath: null,
            }
          : undefined,
      };

      // Get the month for this event
      const startDate = new Date(optimisticEvent.startDate);
      const monthStart = startOfMonth(startDate);
      const monthEnd = endOfMonth(startDate);
      const queryKey = eventsKeys.month(monthStart.getTime(), monthEnd.getTime());

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(queryKey) || [];

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: IDefaultEvent[] = []) => {
        return old.map(event => (event.id === id ? optimisticEvent : event));
      });

      return { previousEvents, queryKey };
    },
    onError: (_err, _updatedEvent, context) => {
      if (context) {
        // If there's an error, roll back to the previous value
        queryClient.setQueryData(context.queryKey, context.previousEvents);
      }
    },
    onSuccess: updatedEvent => {
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
    },
  });
}

export function useDeleteEvent({ onSuccess }: EventMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => {
      return deleteEvent(eventId);
    },
    onMutate: async eventId => {
      // For delete, we need to first find the event to know which month to update
      // Get all query keys containing events
      const queryKeys = queryClient.getQueryCache().findAll({
        queryKey: eventsKeys.all,
      });

      // Prepare context for rolling back
      const contexts: Array<{
        queryKey: readonly unknown[];
        previousEvents: IDefaultEvent[];
      }> = [];

      // Cancel any outgoing refetches
      await Promise.all(queryKeys.map(query => queryClient.cancelQueries({ queryKey: query.queryKey })));

      // Optimistically update each relevant query
      queryKeys.forEach(query => {
        const previousEvents = (queryClient.getQueryData(query.queryKey) as IDefaultEvent[]) || [];
        contexts.push({
          queryKey: query.queryKey,
          previousEvents: [...previousEvents],
        });

        queryClient.setQueryData(query.queryKey, (old: IDefaultEvent[] = []) => {
          return old.filter(event => String(event.id) !== eventId);
        });
      });

      return { contexts };
    },
    onError: (_err, _eventId, context) => {
      if (context?.contexts) {
        // If there's an error, roll back to the previous values
        context.contexts.forEach(ctx => {
          queryClient.setQueryData(ctx.queryKey, ctx.previousEvents);
        });
      }
    },
    onSuccess: () => {
      // Since we don't know which month the event was in, invalidate all
      queryClient.invalidateQueries({
        queryKey: eventsKeys.all,
      });

      // Call optional onSuccess callback
      if (onSuccess) onSuccess();
    },
  });
}
