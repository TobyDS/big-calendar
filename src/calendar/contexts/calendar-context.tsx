"use client";

import { createContext, useContext, useState } from "react";

import type { IBaseEvent, IDefaultEvent, IBaseUser, IDefaultUser } from "@/calendar/interfaces";
import { WeekStartDay, type WeekStartNumber } from "@/calendar/types";

interface ICalendarContext<T extends IBaseEvent = IDefaultEvent, U extends IBaseUser = IDefaultUser> {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: U["id"] | "all" | null;
  setSelectedUserId: (userId: U["id"] | "all" | null) => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  weekStartsOn: WeekStartNumber;
  users?: U[];
  events: T[];
  hasUsers: boolean;
}

const CalendarContext = createContext<ICalendarContext<any, any>>({} as ICalendarContext<any, any>);

interface CalendarProviderProps<T extends IBaseEvent = IDefaultEvent, U extends IBaseUser = IDefaultUser> {
  children: React.ReactNode;
  users?: U[];
  events: T[];
  weekStartsOn?: WeekStartDay;
}

export function CalendarProvider<T extends IBaseEvent = IDefaultEvent, U extends IBaseUser = IDefaultUser>({ 
  children, 
  users, 
  events, 
  weekStartsOn = "Sunday" 
}: CalendarProviderProps<T, U>) {
  const [badgeVariant, setBadgeVariant] = useState<"dot" | "colored">("colored");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<U["id"] | "all" | null>(users ? "all" : null);

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
        events,
        hasUsers: !!users?.length
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
