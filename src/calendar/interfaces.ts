import type { TEventColor } from "@/calendar/types";

export interface IBaseUser {
  id: string;
  name: string;
}

export interface IDefaultUser extends IBaseUser {
  picturePath: string | null;
}

export type IUser<T extends IBaseUser = IDefaultUser> = T;

export interface IBaseEvent {
  id: string | number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
}

export interface IDefaultEvent extends IBaseEvent {
  description: string;
  user?: IDefaultUser;
}

export type IEvent<T extends IBaseEvent = IDefaultEvent> = T;

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
