import type { IDefaultEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

interface SkeletonEvent {
  startHour: number;
  duration: number;
}

interface MonthSkeletonEvent {
  count: number;  // How many events to show in this cell
}

// Define base events with natural overlaps for week/day view
const SKELETON_WEEK_EVENTS: SkeletonEvent[][] = [
  // Monday - Busy morning with natural overlaps
  [
    { startHour: 9, duration: 2 },    // 9:00-11:00
    { startHour: 9.5, duration: 1 },  // 9:30-10:30
    { startHour: 14, duration: 2 },   // 2:00-4:00
    { startHour: 15, duration: 1.5 }, // 3:00-4:30
  ],
  // Tuesday - Mid-day focus
  [
    { startHour: 11, duration: 1.5 }, // 11:00-12:30
    { startHour: 12, duration: 1 },   // 12:00-1:00
    { startHour: 15, duration: 1 },   // 3:00-4:00
  ],
  // Wednesday - Scattered throughout
  [
    { startHour: 9.5, duration: 2 },  // 9:30-11:30
    { startHour: 10, duration: 1 },   // 10:00-11:00
    { startHour: 13.5, duration: 2 }, // 1:30-3:30
    { startHour: 14, duration: 1 },   // 2:00-3:00
  ],
  // Thursday - Afternoon overlaps
  [
    { startHour: 10, duration: 1 },   // 10:00-11:00
    { startHour: 13, duration: 2 },   // 1:00-3:00
    { startHour: 14, duration: 1.5 }, // 2:00-3:30
    { startHour: 14.5, duration: 1 }, // 2:30-3:30
  ],
  // Friday - Morning and afternoon clusters
  [
    { startHour: 9, duration: 1.5 },  // 9:00-10:30
    { startHour: 9.5, duration: 1 },  // 9:30-10:30
    { startHour: 14, duration: 2 },   // 2:00-4:00
  ],
  // Saturday - Sparse but overlapping
  [
    { startHour: 10, duration: 2 },   // 10:00-12:00
    { startHour: 11, duration: 1.5 }, // 11:00-12:30
    { startHour: 15, duration: 1 },   // 3:00-4:00
  ],
  // Sunday - Light day
  [
    { startHour: 9, duration: 1 },    // 9:00-10:00
    { startHour: 13.5, duration: 2 }, // 1:30-3:30
  ],
];

// Define month view skeleton events pattern
// Each number represents a day of the month (1-31)
// The value is the configuration for that day
export const SKELETON_MONTH_EVENTS: Record<number, MonthSkeletonEvent> = {
  // Week 1: Light start
  1: { count: 1 },
  3: { count: 2 },
  5: { count: 1 },
  
  // Week 2: Busy week
  8: { count: 2 },
  9: { count: 3 },
  10: { count: 1 },
  11: { count: 2 },
  12: { count: 1 },
  
  // Week 3: Mid-month meetings
  15: { count: 1 },
  16: { count: 2 },
  17: { count: 3 },
  18: { count: 2 },
  
  // Week 4: Scattered events
  22: { count: 1 },
  23: { count: 2 },
  25: { count: 1 },
  
  // Week 5: End of month wrap-up
  28: { count: 2 },
  29: { count: 1 },
  30: { count: 1 },
  31: { count: 2 }
};

export function createSkeletonEvents(dayIndex: number): IDefaultEvent[] {
  const dayEvents = SKELETON_WEEK_EVENTS[dayIndex % 7];
  
  return dayEvents.map((event, index) => ({
    id: `skeleton-${dayIndex}-${index}`,
    startDate: new Date(2024, 0, 1, Math.floor(event.startHour), (event.startHour % 1) * 60).toISOString(),
    endDate: new Date(2024, 0, 1, 
      Math.floor(event.startHour + event.duration), 
      ((event.startHour + event.duration) % 1) * 60
    ).toISOString(),
    title: "Loading...",
    description: "",
    color: "gray" as TEventColor,
    severity: "none"
  }));
} 