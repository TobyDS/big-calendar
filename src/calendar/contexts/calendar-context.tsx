"use client";

import { createContext, useContext, useState } from "react";

import type { IBaseEvent, IBaseUser, IDefaultEvent, IDefaultUser } from "@/calendar/interfaces";
import { WeekStartDay, type TCalendarView, type WeekStartNumber } from "@/calendar/types";

interface ICalendarContext<T extends IBaseEvent = IDefaultEvent, U extends IBaseUser = IDefaultUser> {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: U["id"] | "all" | null;
  setSelectedUserId: (userId: U["id"] | "all" | null) => void;
  badgeVariant: "dot" | "colored";
  weekStartsOn: WeekStartNumber;
  dayBoundaries?: {
    startHour: number;
    endHour: number;
  };
  users?: U[];
  events: T[];
  isLoadingEvents: boolean;
  currentView: TCalendarView;
  setCurrentView: (view: TCalendarView) => void;
  hasUsers: boolean;
  eventDialog: {
    isOpen: boolean;
    startDate?: Date;
    startTime?: { hour: number; minute: number };
  };
  openEventDialog: (startDate?: Date, startTime?: { hour: number; minute: number }) => void;
  closeEventDialog: () => void;
  eventDetailsDialog: {
    isOpen: boolean;
    event?: T;
  };
  openEventDetailsDialog: (event: T) => void;
  closeEventDetailsDialog: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CalendarContext = createContext<ICalendarContext<any, any>>({} as ICalendarContext<any, any>);

interface CalendarProviderProps<U extends IBaseUser = IDefaultUser> {
  children: React.ReactNode;
  users?: U[];
  initialView?: TCalendarView;
  weekStartsOn?: WeekStartDay;
  badgeVariant?: "dot" | "colored";
  dayBoundaries?: {
    startHour: number;
    endHour: number;
  };
}

export function CalendarProvider<T extends IBaseEvent = IDefaultEvent, U extends IBaseUser = IDefaultUser>({
  children,
  users,
  initialView = "month",
  weekStartsOn = "Sunday",
  badgeVariant = "colored",
  dayBoundaries,
}: CalendarProviderProps<U>) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<U["id"] | "all" | null>(users ? "all" : null);
  const [currentView, setCurrentView] = useState<TCalendarView>(initialView);
  const [eventDialog, setEventDialog] = useState<{
    isOpen: boolean;
    startDate?: Date;
    startTime?: { hour: number; minute: number };
  }>({
    isOpen: false,
  });
  const [eventDetailsDialog, setEventDetailsDialog] = useState<{
    isOpen: boolean;
    event?: T;
  }>({
    isOpen: false,
  });

  // We're using empty array initially - actual events are now loaded in the ClientContainer
  const events: T[] = [];
  const isLoadingEvents = false;

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const openEventDialog = (startDate?: Date, startTime?: { hour: number; minute: number }) => {
    setEventDialog({
      isOpen: true,
      startDate,
      startTime,
    });
  };

  const closeEventDialog = () => {
    setEventDialog({
      isOpen: false,
    });
  };

  const openEventDetailsDialog = (event: T) => {
    setEventDetailsDialog({
      isOpen: true,
      event,
    });
  };

  const closeEventDetailsDialog = () => {
    setEventDetailsDialog({
      isOpen: false,
    });
  };

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate: handleSelectDate,
        selectedUserId,
        setSelectedUserId,
        badgeVariant,
        weekStartsOn: WeekStartDay[weekStartsOn],
        dayBoundaries,
        users,
        events,
        isLoadingEvents,
        currentView,
        setCurrentView,
        hasUsers: !!users?.length,
        eventDialog,
        openEventDialog,
        closeEventDialog,
        eventDetailsDialog,
        openEventDetailsDialog,
        closeEventDetailsDialog,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar<T extends IBaseEvent = IDefaultEvent, U extends IBaseUser = IDefaultUser>(): ICalendarContext<T, U> {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
