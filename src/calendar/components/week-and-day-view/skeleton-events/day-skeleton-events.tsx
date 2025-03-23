import { DayEventSkeleton } from "@/calendar/components/skeleton";
import { CELL_HEIGHT_PX } from "@/calendar/helpers";

export interface ISkeletonProps {
  dayIndex: number;
  dayBoundaries?: {
    startHour: number;
    endHour: number;
  };
}

export function SingleDaySkeletonEvents({ dayBoundaries }: { dayBoundaries?: ISkeletonProps['dayBoundaries'] }) {
  const skeletonEvents = [
    { startHour: 9, duration: 2 },
    { startHour: 12, duration: 1 },
    { startHour: 14, duration: 2 },
    { startHour: 16, duration: 1 }
  ];
  
  return (
    <>
      {skeletonEvents.map((config, index) => {
        const style = {
          left: `${0}%`,
          width: `${100}%`,
          top: `${(config.startHour - dayBoundaries!.startHour) * CELL_HEIGHT_PX}px`,
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