import { DayEventSkeleton } from "@/calendar/components/skeleton";
import { groupEvents, getEventBlockStyle } from "@/calendar/helpers";
import { createSkeletonEvents } from "@/calendar/helpers/skeleton-events";
export interface ISkeletonProps {
  dayIndex: number;
  dayBoundaries?: {
    startHour: number;
    endHour: number;
  };
}

export function WeekSkeletonEvents({ dayIndex, dayBoundaries }: ISkeletonProps) {
  const groupedEvents = groupEvents(createSkeletonEvents(dayIndex));

  return (
    <>
      {groupedEvents.flatMap(group =>
        group.events.map(({ event, column }) => {
          const style = {
            ...getEventBlockStyle(event, column, dayBoundaries, group.totalColumns),
            zIndex: group.totalColumns - column,
          };

          return (
            <div key={event.id} className="pointer-events-auto absolute p-1" style={style}>
              <DayEventSkeleton />
            </div>
          );
        })
      )}
    </>
  );
}
