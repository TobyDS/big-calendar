"use client";

import { useMemo } from "react";
import { isSameDay, parseISO } from "date-fns";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { CalendarHeader } from "@/calendar/components/header/calendar-header";
import { CalendarMonthView } from "@/calendar/components/month-view/calendar-month-view";
import { CalendarDayView } from "@/calendar/components/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/calendar/components/week-and-day-view/calendar-week-view";
import type { TCalendarView } from "@/calendar/types";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";

interface IProps {
  view: TCalendarView;
}

export function ClientContainer({ view }: IProps) {
  const { selectedDate, selectedUserId, events, hasUsers } = useCalendar();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const itemStartDate = new Date(event.startDate);
      const itemEndDate = new Date(event.endDate);

      const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const isInSelectedMonth = itemStartDate <= monthEnd && itemEndDate >= monthStart;
      const isUserMatch = !hasUsers || selectedUserId === "all" || (event.user && event.user.id === selectedUserId);
      return isInSelectedMonth && isUserMatch;
    });
  }, [selectedDate, selectedUserId, events, hasUsers]);

  const singleDayEvents = filteredEvents.filter(event => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  return (
    <div className="rounded-xl border">
      <CalendarHeader view={view} events={filteredEvents} />
      {view === "month" && <CalendarMonthView singleDayEvents={singleDayEvents} />}
      {view === "week" && <CalendarWeekView singleDayEvents={singleDayEvents} />}
      {view === "day" && <CalendarDayView singleDayEvents={singleDayEvents} />}
      <AddEventDialog>{null}</AddEventDialog>
    </div>
  );
}
