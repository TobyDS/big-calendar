import { DayEventSkeleton } from "@/calendar/components/skeleton";
import { groupEvents, getEventBlockStyle } from "@/calendar/helpers";
import { createSkeletonEvents } from "@/calendar/helpers/skeleton-events";

interface IProps {
  dayIndex: number;
  dayBoundaries?: {
    startHour: number;
    endHour: number;
  };
}

export function SkeletonDayEvents({ dayIndex, dayBoundaries }: IProps) {
  // Use the same grouping logic as real events
  const groupedEvents = groupEvents(createSkeletonEvents(dayIndex));

  // Render grouped events
  return (
    <>
      {groupedEvents.flatMap(group => 
        group.events.map(({ event, column }) => {
          const style = {
            ...getEventBlockStyle(event, column, dayBoundaries, group.totalColumns),
            zIndex: group.totalColumns - column, // Stack events with later ones on top
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