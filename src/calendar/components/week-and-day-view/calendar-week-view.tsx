import { startOfWeek, addDays, format, parseISO, isSameDay } from "date-fns";
import { CELL_HEIGHT_PX, getCalendarHeight, getDisplayHours } from "@/calendar/helpers";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventBlock } from "@/calendar/components/week-and-day-view/event-block";
import { CalendarTimeline } from "@/calendar/components/week-and-day-view/calendar-time-line";
import { SkeletonDayEvents } from "@/calendar/components/week-and-day-view/skeleton-events";
import { groupEvents, getEventBlockStyle } from "@/calendar/helpers";
import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
  isLoading?: boolean;
}

const DAYS_IN_WEEK = 7;

export function CalendarWeekView({ singleDayEvents, isLoading = false }: IProps) {
  const { selectedDate, weekStartsOn, openEventDialog, dayBoundaries } = useCalendar();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn });
  const weekDays = Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(weekStart, i));
  const hours = getDisplayHours(dayBoundaries);
  const calendarHeight = getCalendarHeight(dayBoundaries);

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-t-quaternary sm:hidden">
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        <div>

          {/* Week header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day, index) => (
                <span key={index} className="py-2 text-center text-xs font-medium text-t-quaternary">
                  {format(day, "EE")} <span className="ml-1 font-semibold text-t-secondary">{format(day, "d")}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="relative h-[736px]" type="always" orientation="vertical">
          <div className="flex h-full">
            {/* Hours column */}
            <div className="relative w-18" style={{ height: `${calendarHeight}px` }}>
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: `${CELL_HEIGHT_PX}px` }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && <span className="text-xs text-t-quaternary">{format(new Date().setHours(hour), "hh a")}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l" style={{ height: `${calendarHeight}px` }}>
              <div className="grid h-full grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = singleDayEvents.filter(event => isSameDay(parseISO(event.startDate), day) || isSameDay(parseISO(event.endDate), day));
                  const groupedEvents = groupEvents(dayEvents);

                  return (
                    <div key={dayIndex} className="relative h-full">
                      {hours.map((hour, index) => (
                        <div key={hour} className="relative" style={{ height: `${CELL_HEIGHT_PX}px` }}>
                          {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>}
                          <div 
                            className="absolute inset-x-0 top-0 h-[48px] cursor-pointer transition-colors hover:bg-bg-primary-hover"
                            onClick={() => openEventDialog(day, { hour, minute: 0 })}
                          />

                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed border-b-tertiary"></div>

                          <div 
                            className="absolute inset-x-0 top-[48px] h-[48px] cursor-pointer transition-colors hover:bg-bg-primary-hover"
                            onClick={() => openEventDialog(day, { hour, minute: 30 })}
                          />
                        </div>
                      ))}

                      <div className="pointer-events-none absolute inset-0" style={{ height: `${calendarHeight}px`, overflow: 'hidden' }}>
                        {isLoading ? (
                          <SkeletonDayEvents dayIndex={dayIndex} dayBoundaries={dayBoundaries} />
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
                  );
                })}
              </div>

              <CalendarTimeline view="week" />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
