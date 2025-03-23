import { useCalendar } from "@/calendar/contexts/calendar-context";
import { CELL_HEIGHT_PX, DAYS_IN_WEEK, MINUTES_IN_HOUR } from "@/calendar/helpers/constants";
import { format, isSameDay, isSameWeek } from "date-fns";
import { useEffect, useState } from "react";

interface Props {
  view: 'week' | 'day';
}

export function CalendarTimeline({ view }: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { selectedDate, weekStartsOn, dayBoundaries } = useCalendar();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Only show if we're looking at today (day view) or current week (week view)
  const shouldShow = view === 'day' 
    ? isSameDay(currentTime, selectedDate)
    : isSameWeek(currentTime, selectedDate, { weekStartsOn });

  // Check if current time is within day boundaries
  const isWithinBoundaries = () => {
    const startHour = dayBoundaries?.startHour ?? 0;
    const endHour = dayBoundaries?.endHour ?? 23;
    
    const currentMinutes = currentTime.getHours() * MINUTES_IN_HOUR + currentTime.getMinutes();
    const startMinutes = startHour * MINUTES_IN_HOUR;
    const endMinutes = endHour * MINUTES_IN_HOUR;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  const getCurrentTimePosition = () => {
    const startHour = dayBoundaries?.startHour ?? 0;
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Calculate minutes from the start of the visible range
    const minutesFromStart = (currentHour - startHour) * MINUTES_IN_HOUR + currentMinute;
    return (minutesFromStart / MINUTES_IN_HOUR) * CELL_HEIGHT_PX;
  };

  // Don't render anything if outside today/current week or outside boundaries
  if (!shouldShow || !isWithinBoundaries()) return null;

  const formatCurrentTime = () => {
    return format(currentTime, "hh:mm a");
  };

  // For week view, calculate which day column we're in (0-6)
  const getDotPosition = () => {
    if (view === 'day') return "-1.5px";
    
    const currentDayColumn = currentTime.getDay();
    const adjustedColumn = (currentDayColumn - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    return (adjustedColumn * (100 / DAYS_IN_WEEK)) + "%";
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50"
      style={{ 
        top: `${getCurrentTimePosition()}px`,
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
            width: `calc(100% / ${DAYS_IN_WEEK})`,
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
