"use client";

import { createContext, useContext, useState } from "react";

import type { IBaseEvent, IDefaultEvent, IUser } from "@/calendar/interfaces";
import { WeekStartDay, type WeekStartNumber } from "@/calendar/types";

interface ICalendarContext<T extends IBaseEvent = IDefaultEvent> {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  weekStartsOn: WeekStartNumber;
  users: IUser[];
  events: T[];
}

const CalendarContext = createContext<ICalendarContext<any>>({} as ICalendarContext<any>);

interface CalendarProviderProps<T extends IBaseEvent = IDefaultEvent> {
  children: React.ReactNode;
  users: IUser[];
  events: T[];
  weekStartsOn?: WeekStartDay;
}

export function CalendarProvider<T extends IBaseEvent = IDefaultEvent>({ 
  children, 
  users, 
  events, 
  weekStartsOn = "Sunday" 
}: CalendarProviderProps<T>) {
  const [badgeVariant, setBadgeVariant] = useState<"dot" | "colored">("colored");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  return (
    <CalendarContext.Provider
      value={{ 
        selectedDate, 
        setSelectedDate: handleSelectDate, 
        selectedUserId, 
        setSelectedUserId, 
        badgeVariant, 
        setBadgeVariant, 
        weekStartsOn: WeekStartDay[weekStartsOn],
        users, 
        events 
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar<T extends IBaseEvent = IDefaultEvent>(): ICalendarContext<T> {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
