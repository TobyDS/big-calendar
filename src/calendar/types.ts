export type TCalendarView = "day" | "week" | "month";
export type TEventColor = "blue" | "indigo" | "pink" | "red" | "orange" | "amber" | "emerald";

export const WeekStartDay = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const;

export type WeekStartDay = keyof typeof WeekStartDay;
export type WeekStartNumber = typeof WeekStartDay[WeekStartDay];
