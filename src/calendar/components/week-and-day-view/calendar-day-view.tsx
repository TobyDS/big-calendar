import { Calendar, Clock, User } from "lucide-react";
import { parseISO, format, isWithinInterval } from "date-fns";
import { useMemo } from "react";

import { DayPicker } from "@/components/ui/day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventBlock } from "@/calendar/components/week-and-day-view/event-block";
import { CalendarTimeline } from "@/calendar/components/week-and-day-view/calendar-time-line";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { DayEventSkeleton, Skeleton } from "@/calendar/components/skeleton";
import { 
  CELL_HEIGHT_PX, 
  getDisplayHours, 
  getCalendarHeight, 
  groupEvents, 
  getEventBlockStyle 
} from "@/calendar/helpers";
import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
  isLoading?: boolean;
}

function isEventInProgress(event: IEvent): boolean {
  const now = new Date();
  return isWithinInterval(now, {
    start: parseISO(event.startDate),
    end: parseISO(event.endDate),
  });
}

export function CalendarDayView({ singleDayEvents, isLoading = false }: IProps) {
  const { selectedDate, setSelectedDate, users, weekStartsOn, hasUsers, openEventDialog, dayBoundaries } = useCalendar();

  const hours = useMemo(() => getDisplayHours(dayBoundaries), [dayBoundaries]);
  const calendarHeight = useMemo(() => getCalendarHeight(dayBoundaries), [dayBoundaries]);
  
  const dayEvents = useMemo(() => {
    return singleDayEvents.filter(event => {
      const eventDate = parseISO(event.startDate);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [singleDayEvents, selectedDate]);

  const groupedEvents = useMemo(() => groupEvents(dayEvents), [dayEvents]);

  const currentEvents = useMemo(
    () => dayEvents.filter(event => isEventInProgress(event)),
    [dayEvents]
  );
  
  // Generate deterministic skeleton placeholder events for loading state
  const getSkeletonEvents = () => {
    if (!isLoading) return null;
    
    // Fixed skeleton configuration
    const skeletonEvents = [
      { startHour: 9, duration: 2 },
      { startHour: 12, duration: 1 },
      { startHour: 14, duration: 2 },
      { startHour: 16, duration: 1 }
    ];
    
    return skeletonEvents.map((config, index) => {
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
    });
  };

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <ScrollArea className="relative h-[800px]" type="always" orientation="vertical">
          <div className="flex h-full">
            {/* Hours column */}
            <div className="relative w-18" style={{ height: `${calendarHeight}px` }}>
              {hours.map((hour: number, index: number) => (
                <div key={hour} className="relative" style={{ height: `${CELL_HEIGHT_PX}px` }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && <span className="text-xs text-t-quaternary">{format(new Date().setHours(hour), "hh a")}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="relative flex-1 border-l" style={{ height: `${calendarHeight}px` }}>
              <div className="relative">
                {hours.map((hour: number, index: number) => (
                  <div key={hour} className="relative" style={{ height: `${CELL_HEIGHT_PX}px` }}>
                    {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>}

                    <div 
                      className="absolute inset-x-0 top-0 h-[48px] cursor-pointer transition-colors hover:bg-bg-primary-hover"
                      onClick={() => openEventDialog(new Date(selectedDate), { hour, minute: 0 })}
                    />

                    <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed border-b-tertiary"></div>

                    <div 
                      className="absolute inset-x-0 top-[48px] h-[48px] cursor-pointer transition-colors hover:bg-bg-primary-hover"
                      onClick={() => openEventDialog(new Date(selectedDate), { hour, minute: 30 })}
                    />
                  </div>
                ))}

                {/* Events */}
                <div className="pointer-events-none absolute inset-0" style={{ height: `${calendarHeight}px`, overflow: 'hidden' }}>
                  {isLoading ? (
                    getSkeletonEvents()
                  ) : (
                    groupedEvents.map(group =>
                      group.events.map(({ event, column }) => {
                        const style = getEventBlockStyle(
                          event,
                          column,
                          dayBoundaries,
                          group.totalColumns
                        );
                        
                        return (
                          <div key={event.id} className="pointer-events-auto absolute p-1" style={style}>
                            <EventBlock event={event} />
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              </div>

              {/* Current time indicator */}
              <CalendarTimeline view="day" />
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="hidden w-72 divide-y border-l md:block">
        <DayPicker 
          className="mx-auto w-fit" 
          mode="single" 
          selected={selectedDate} 
          onSelect={setSelectedDate} 
          initialFocus
          weekStartsOn={weekStartsOn}
        />

        <div className="flex-1 space-y-3">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="mb-4 h-6 w-48" />
              <div className="space-y-5">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full max-w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full max-w-36" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          ) : currentEvents.length > 0 ? (
            <div className="flex items-start gap-2 px-4 pt-4">
              <span className="relative mt-[5px] flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-success-600"></span>
              </span>

              <p className="text-sm font-semibold text-t-secondary">Happening now</p>
            </div>
          ) : (
            <p className="p-4 text-center text-sm italic text-t-tertiary">No appointments or consultations at the moment</p>
          )}

          {!isLoading && currentEvents.length > 0 && (
            <ScrollArea className="h-[422px] px-4" type="always">
              <div className="space-y-6 pb-4">
                {currentEvents.map(event => {
                  const user = hasUsers && event.user ? users?.find(user => user.id === event.user?.id) : null;

                  return (
                    <div key={event.id} className="space-y-1.5">
                      <p className="line-clamp-2 text-sm font-semibold">{event.title}</p>

                      {user && (
                        <div className="flex items-center gap-1.5">
                          <User className="size-4 text-t-quinary" />
                          <span className="text-sm text-t-tertiary">{user.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-4 text-t-quinary" />
                        <span className="text-sm text-t-tertiary">{format(new Date(), "MMM d, yyyy")}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="size-4 text-t-quinary" />
                        <span className="text-sm text-t-tertiary">
                          {format(parseISO(event.startDate), "hh:mm a")} - {format(parseISO(event.endDate), "hh:mm a")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
