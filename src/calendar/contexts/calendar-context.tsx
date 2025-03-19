"use client";

import { createContext, useContext, useState } from "react";

import type { IEvent, IUser } from "@/calendar/interfaces";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  users: IUser[];
  events: IEvent[];
}

const CalendarContext = createContext({} as ICalendarContext);

interface CalendarProviderProps {
  children: React.ReactNode;
  users: IUser[];
  events: IEvent[];
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function CalendarProvider({ children, users, events, weekStartsOn = 0 }: CalendarProviderProps) {
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
        weekStartsOn,
        users, 
        events 
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
