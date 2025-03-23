import { DayEventSkeleton } from "@/calendar/components/skeleton";
import type { ISkeletonProps } from "@/calendar/components/week-and-day-view/skeleton-events/week-skeleton-events";
import { CELL_HEIGHT_PX } from "@/calendar/helpers";

export function SingleDaySkeletonEvents({ dayBoundaries }: Omit<ISkeletonProps, "dayIndex">) {
  const skeletonEvents = [
    { startHour: 9, duration: 2 },
    { startHour: 12, duration: 1 },
    { startHour: 14, duration: 2 },
    { startHour: 16, duration: 1 },
  ];

  return (
    <>
      {skeletonEvents.map((config, index) => {
        const style = {
          left: `${0}%`,
          width: `${100}%`,
          top: `${(config.startHour - (dayBoundaries?.startHour ?? 0)) * CELL_HEIGHT_PX}px`,
          height: `${config.duration * CELL_HEIGHT_PX}px`,
        };

        return (
          <div key={`skeleton-${index}`} className="pointer-events-auto absolute p-1" style={style}>
            <DayEventSkeleton />
          </div>
        );
      })}
    </>
  );
}
