"use client";

import { useForm } from "react-hook-form";
import type { TimeValue } from "react-aria-components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { SingleDayPickerInput } from "@/components/ui/single-day-picker-input";

import { eventSchema, type TEventFormData } from "@/calendar/schemas";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useCreateEvent } from "@/hooks/use-calendar-mutations";
import { useToast } from "@/hooks/use-toast";

export function AddEventDialog() {
  const { eventDialog, closeEventDialog, selectedUserId } = useCalendar();
  const { toast } = useToast();
  const { mutate: createEvent, isPending } = useCreateEvent({
    onSuccess: () => {
      toast({
        title: "Event created successfully",
      });
      closeEventDialog();
      form.reset();
    },
  });

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      startTime: undefined,
      endDate: undefined,
      endTime: undefined,
      variant: undefined,
    },
  });

  useEffect(() => {
    if (eventDialog.isOpen) {
      form.reset({
        title: "",
        description: "",
        startDate: eventDialog.startDate,
        startTime: eventDialog.startTime,
        endDate: eventDialog.startDate, // Default end date to same as start date
        endTime: eventDialog.startTime 
          ? { hour: Math.min(eventDialog.startTime.hour + 1, 23), minute: eventDialog.startTime.minute }
          : undefined,
        variant: "blue",
      });
    }
  }, [eventDialog.isOpen, eventDialog.startDate, eventDialog.startTime, form]);

  const onSubmit = (values: TEventFormData) => {
    const userId = selectedUserId !== "all" && selectedUserId !== null 
      ? selectedUserId 
      : undefined;
      
    createEvent({ ...values, userId });
  };

  return (
    <Dialog.Root open={eventDialog.isOpen} onOpenChange={open => !open && closeEventDialog()}>
      <Dialog.Content aria-describedby="event-form-description">
        <Dialog.Close />

        <Dialog.Header>
          <Dialog.Title>Add New Event</Dialog.Title>
          <Dialog.Description id="event-form-description" className="sr-only">Fill in the details to create a new calendar event.</Dialog.Description>
        </Dialog.Header>

        <Dialog.Body>
          <Form.Root {...form}>
            <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <Form.Field
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Form.Item>
                    <Form.Label htmlFor="title" required>
                      Title
                    </Form.Label>

                    <Form.Control>
                      <Input id="title" placeholder="Enter a title" data-invalid={fieldState.invalid} {...field} />
                    </Form.Control>

                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />

              <div className="flex items-start gap-2">
                <Form.Field
                  control={form.control}
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <Form.Item className="flex-1">
                      <Form.Label htmlFor="startDate" required>
                        Start Date
                      </Form.Label>

                      <Form.Control>
                        <SingleDayPickerInput
                          id="startDate"
                          value={field.value}
                          onSelect={date => field.onChange(date as Date)}
                          placeholder="Select a date"
                          data-invalid={fieldState.invalid}
                        />
                      </Form.Control>

                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="startTime"
                  render={({ field, fieldState }) => (
                    <Form.Item className="flex-1">
                      <Form.Label required>Start Time</Form.Label>

                      <Form.Control>
                        <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                      </Form.Control>

                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
              </div>

              <div className="flex items-start gap-2">
                <Form.Field
                  control={form.control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <Form.Item className="flex-1">
                      <Form.Label required>End Date</Form.Label>
                      <Form.Control>
                        <SingleDayPickerInput
                          value={field.value}
                          onSelect={date => field.onChange(date as Date)}
                          placeholder="Select a date"
                          data-invalid={fieldState.invalid}
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="endTime"
                  render={({ field, fieldState }) => (
                    <Form.Item className="flex-1">
                      <Form.Label required>End Time</Form.Label>
                      <Form.Control>
                        <TimeInput value={field.value as TimeValue} onChange={field.onChange} hourCycle={12} data-invalid={fieldState.invalid} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
              </div>

              <Form.Field
                control={form.control}
                name="variant"
                render={({ field, fieldState }) => (
                  <Form.Item>
                    <Form.Label required>Variant</Form.Label>
                    <Form.Control>
                      <Select.Root value={field.value} onValueChange={field.onChange}>
                        <Select.Trigger data-invalid={fieldState.invalid}>
                          <Select.Value placeholder="Select an option" />
                        </Select.Trigger>

                        <Select.Content>
                          <Select.Item value="blue">
                            <div className="flex items-center gap-2">
                              <div className="size-3.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                              Blue
                            </div>
                          </Select.Item>

                          <Select.Item value="indigo">
                            <div className="flex items-center gap-2">
                              <div className="size-3.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                              Indigo
                            </div>
                          </Select.Item>

                          <Select.Item value="pink">
                            <div className="flex items-center gap-2">
                              <div className="size-3.5 rounded-full bg-pink-500 dark:bg-pink-400" />
                              Pink
                            </div>
                          </Select.Item>

                          <Select.Item value="red">
                            <div className="flex items-center gap-2">
                              <div className="size-3.5 rounded-full bg-red-500 dark:bg-red-400" />
                              Red
                            </div>
                          </Select.Item>

                          <Select.Item value="orange">
                            <div className="flex items-center gap-2">
                              <div className="size-3.5 rounded-full bg-orange-500 dark:bg-orange-400" />
                              Orange
                            </div>
                          </Select.Item>

                          <Select.Item value="amber">
                            <div className="flex items-center gap-2">
                              <div className="size-3.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                              Amber
                            </div>
                          </Select.Item>

                          <Select.Item value="emerald">
                            <div className="flex items-center gap-2">
                              <div className="size-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                              Emerald
                            </div>
                          </Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>

                    <Form.Control>
                      <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                    </Form.Control>

                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </form>
          </Form.Root>
        </Dialog.Body>

        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Dialog.Close>

          <Button form="event-form" type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Event"}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
