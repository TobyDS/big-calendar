"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { useCalendar } from "@/calendar/contexts/calendar-context";

export function EventDetailsDialog() {
  const { eventDetailsDialog, closeEventDetailsDialog } = useCalendar();
  const event = eventDetailsDialog.event;

  if (!event) return null;

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  return (
    <Dialog.Root open={eventDetailsDialog.isOpen} onOpenChange={open => !open && closeEventDetailsDialog()}>
      <Dialog.Content size="xs" aria-describedby="event-details-description">
        <Dialog.Close />

        <Dialog.Header>
          <Dialog.Title>Event Details</Dialog.Title>
          <Dialog.Description id="event-details-description" className="sr-only">Details for {event.title}</Dialog.Description>
        </Dialog.Header>

        <Dialog.Body>
          <div className="space-y-4">
            {event.user && (
              <div className="flex items-start gap-2">
                <User className="mt-1 size-4 shrink-0 text-t-secondary" />
                <div>
                  <p className="text-sm font-medium">Responsible</p>
                  <p className="text-sm text-t-secondary">{event.user.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0 text-t-secondary" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-t-secondary">{format(startDate, "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0 text-t-secondary" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-t-secondary">{format(endDate, "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>

            {event.description && (
              <div className="flex items-start gap-2">
                <Text className="mt-1 size-4 shrink-0 text-t-secondary" />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-t-secondary">{event.description}</p>
                </div>
              </div>
            )}
          </div>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  );
}
