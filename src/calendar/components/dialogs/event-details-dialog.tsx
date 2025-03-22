"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Edit, Text, Trash, User } from "lucide-react";
import { useState } from "react";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useDeleteEvent } from "@/hooks/use-calendar-mutations";
import { useToast } from "@/hooks/use-toast";
import { EditEventForm } from "@/calendar/components/forms/edit-event-form";

export function EventDetailsDialog() {
  const { eventDetailsDialog, closeEventDetailsDialog } = useCalendar();
  const event = eventDetailsDialog.event;
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent({
    onSuccess: () => {
      toast({
        title: "Event deleted successfully",
      });
      closeEventDetailsDialog();
    }
  });

  if (!event) return null;

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  
  const handleDelete = () => {
    if (typeof event.id === "string") {
      deleteEvent(event.id);
    } else {
      deleteEvent(String(event.id));
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <Dialog.Root open={eventDetailsDialog.isOpen} onOpenChange={open => !open && closeEventDetailsDialog()}>
      <Dialog.Content size="xs" aria-describedby="event-details-description">
        <Dialog.Close />

        <Dialog.Header>
          <Dialog.Title>{isEditing ? "Edit Event" : "Event Details"}</Dialog.Title>
          <Dialog.Description id="event-details-description" className="sr-only">
            {isEditing ? `Edit ${event.title}` : `Details for ${event.title}`}
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Body>
          {isEditing ? (
            <EditEventForm 
              event={event} 
              onCancelAction={cancelEdit} 
              onSuccessAction={() => {
                closeEventDetailsDialog();
                setIsEditing(false);
              }} 
            />
          ) : (
            <div className="space-y-4">
              <div className="mb-2">
                <h3 className="text-lg font-medium">{event.title}</h3>
              </div>
              
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
          )}
        </Dialog.Body>

        <Dialog.Footer>
          {isEditing ? null : (
            <>
              <div className="flex flex-1 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon-sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon-sm" 
                  onClick={handleEdit}
                >
                  <Edit className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </div>
              
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </Dialog.Close>
            </>
          )}
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
