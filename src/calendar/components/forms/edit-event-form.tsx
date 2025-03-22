"use client";

import { useForm } from "react-hook-form";
import type { TimeValue } from "react-aria-components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { getHours, getMinutes, parseISO } from "date-fns";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { SingleDayPickerInput } from "@/components/ui/single-day-picker-input";

import { eventSchema, type TEventFormData } from "@/calendar/schemas";
import { useUpdateEvent } from "@/hooks/use-calendar-mutations";
import { useToast } from "@/hooks/use-toast";
import type { IEvent } from "@/calendar/interfaces";
import { useCalendar } from "@/calendar/contexts/calendar-context";

interface EditEventFormProps {
  event: IEvent;
  onCancelAction: () => void;
  onSuccessAction: () => void;
}

export function EditEventForm({ event, onCancelAction, onSuccessAction }: EditEventFormProps) {
  const { toast } = useToast();
  const { users, selectedUserId } = useCalendar();
  const { mutate: updateEvent, isPending } = useUpdateEvent({
    onSuccess: () => {
      toast({
        title: "Event updated successfully",
      });
      if (onSuccessAction) onSuccessAction();
    },
  });

  const form = useForm<TEventFormData & { userId?: string }>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      startTime: undefined,
      endDate: undefined,
      endTime: undefined,
      variant: undefined,
      userId: undefined,
    },
  });

  useEffect(() => {
    // Parse event data for the form
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    
    form.reset({
      title: event.title,
      description: event.description || "",
      startDate,
      startTime: {
        hour: getHours(startDate),
        minute: getMinutes(startDate),
      },
      endDate,
      endTime: {
        hour: getHours(endDate),
        minute: getMinutes(endDate),
      },
      variant: event.color,
      userId: event.user?.id,
    });
  }, [event, form]);

  const onSubmit = (values: TEventFormData & { userId?: string }) => {
    updateEvent({ 
      ...values, 
      id: typeof event.id === 'string' ? event.id : String(event.id),
    });
  };

  return (
    <Form.Root {...form}>
      <form id="edit-event-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
        
        {users && users.length > 0 && (
          <Form.Field
            control={form.control}
            name="userId"
            render={({ field, fieldState }) => (
              <Form.Item>
                <Form.Label>Assign to User</Form.Label>
                <Form.Control>
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger data-invalid={fieldState.invalid}>
                      <Select.Value placeholder="Select a user (optional)" />
                    </Select.Trigger>

                    <Select.Content>
                      <Select.Item value="none">
                        <span>None</span>
                      </Select.Item>
                      {users.map((user) => (
                        <Select.Item key={user.id} value={user.id}>
                          {user.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
        )}

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
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancelAction}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form.Root>
  );
} 