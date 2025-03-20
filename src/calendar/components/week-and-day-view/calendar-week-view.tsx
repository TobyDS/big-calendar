import { startOfWeek, addDays, format, parseISO, isSameDay, areIntervalsOverlapping } from "date-fns";
import { HOURS_IN_DAY, DAYS_IN_WEEK, CELL_HEIGHT_PX } from "@/calendar/helpers";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddEventDialog } from "@/calendar/components/dialogs/add-event-dialog";
import { EventBlock } from "@/calendar/components/week-and-day-view/event-block";
import { CalendarTimeline } from "@/calendar/components/week-and-day-view/calendar-time-line";

import { groupEvents, getEventBlockStyle } from "@/calendar/helpers";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  singleDayEvents: IEvent[];
}

export function CalendarWeekView({ singleDayEvents }: IProps) {
  const { selectedDate, weekStartsOn, openEventDialog } = useCalendar();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn });
  const weekDays = Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: HOURS_IN_DAY }, (_, i) => i);

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

        <ScrollArea className="h-[736px]" type="always">
          <div className="flex">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: `${CELL_HEIGHT_PX}px` }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && <span className="text-xs text-t-quaternary">{format(new Date().setHours(hour), "hh a")}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = singleDayEvents.filter(event => isSameDay(parseISO(event.startDate), day) || isSameDay(parseISO(event.endDate), day));
                  const groupedEvents = groupEvents(dayEvents);

                  return (
                    <div key={dayIndex} className="relative">
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

                        {groupedEvents.map(group =>
                          group.events.map(({ event, column }) => {
                            const style = getEventBlockStyle(
                              event,
                              column,
                              null,
                              group.totalColumns
                            );
                            
                            return (
                              <div key={event.id} className="absolute p-1" style={style}>
                                <EventBlock event={event} />
                              </div>
                            );
                          })
                        )}
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
