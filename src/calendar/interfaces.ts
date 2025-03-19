import type { TEventColor } from "@/calendar/types";

export interface IUser {
  id: string;
  name: string;
  picturePath: string | null;
}

export interface IBaseEvent {
  id: string | number;
  startDate: string;
  endDate: string;
  title: string;
}

export interface IDefaultEvent extends IBaseEvent {
  color: TEventColor;
  description: string;
  user: IUser;
}

export type IEvent<T extends IBaseEvent = IDefaultEvent> = T;

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
