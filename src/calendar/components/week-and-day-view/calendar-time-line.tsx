import { format } from "date-fns";
import { useEffect, useState } from "react";
import { MINUTES_IN_DAY, UPDATE_INTERVAL_MS } from "@/calendar/helpers";

export function CalendarTimeline() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), UPDATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return (minutes / MINUTES_IN_DAY) * 100;
  };

  const formatCurrentTime = () => {
    return format(currentTime, "hh:mm a");
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 border-t border-primary-600 dark:border-primary-700"
      style={{ top: `${getCurrentTimePosition()}%` }}
    >
      <div className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-primary-600 dark:bg-primary-700"></div>

      <div className="absolute -left-18 flex w-16 -translate-y-1/2 justify-end bg-bg-primary pr-1 text-xs font-medium text-primary-600 dark:text-primary-700">
        {formatCurrentTime()}
      </div>
    </div>
  );
}
