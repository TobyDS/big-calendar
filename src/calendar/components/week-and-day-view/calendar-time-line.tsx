import { format, isSameDay, isSameWeek, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { MINUTES_IN_DAY, UPDATE_INTERVAL_MS } from "@/calendar/helpers";

interface Props {
  view: 'week' | 'day';
}

export function CalendarTimeline({ view }: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { selectedDate, weekStartsOn } = useCalendar();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), UPDATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Only show if we're looking at today (day view) or current week (week view)
  const shouldShow = view === 'day' 
    ? isSameDay(currentTime, selectedDate)
    : isSameWeek(currentTime, selectedDate, { weekStartsOn });

  if (!shouldShow) return null;

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return (minutes / MINUTES_IN_DAY) * 100;
  };

  const formatCurrentTime = () => {
    return format(currentTime, "hh:mm a");
  };

  // For week view, calculate which day column we're in (0-6)
  const getDotPosition = () => {
    if (view === 'day') return "-1.5px";
    
    const currentDayColumn = currentTime.getDay();
    const adjustedColumn = (currentDayColumn - weekStartsOn + 7) % 7;
    return (adjustedColumn * (100 / 7)) + "%";
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50"
      style={{ 
        top: `${getCurrentTimePosition()}%`,
        "--time-line-width": "1px"
      } as React.CSSProperties}
    >
      {/* Full width line with lower opacity */}
      <div className="absolute inset-x-0 border-t border-primary-600 opacity-30 dark:border-primary-700" />

      {/* Today's column line with full opacity */}
      {view === 'week' && (
        <div 
          className="absolute border-t border-primary-600 dark:border-primary-700"
          style={{
            left: getDotPosition(),
            width: "calc(100% / 7)",
            transform: "translateX(-0.5px)" // Adjust for border alignment
          }}
        />
      )}

      {/* Full opacity line for day view */}
      {view === 'day' && (
        <div className="absolute inset-x-0 border-t border-primary-600 dark:border-primary-700" />
      )}

      <div 
        className="absolute size-3 rounded-full bg-primary-600 dark:bg-primary-700"
        style={{ 
          left: getDotPosition(), 
          transform: "translate(-50%, calc(-50% - var(--time-line-width) / 2))"
        }}
      />

      <div className="absolute -left-18 flex w-16 -translate-y-1/2 justify-end bg-bg-primary pr-1 text-xs font-medium text-primary-600 dark:text-primary-700">
        {formatCurrentTime()}
      </div>
    </div>
  );
}
