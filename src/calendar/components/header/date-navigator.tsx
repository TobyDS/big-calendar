import { formatDate } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import { getEventsCount, navigateDate, rangeText } from "@/calendar/helpers";
import type { IEvent } from "@/calendar/interfaces";
import type { TCalendarView } from "@/calendar/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DateNavigator({ view, events }: { view: TCalendarView; events: IEvent[] }) {
  const { selectedDate, setSelectedDate, weekStartsOn, dayBoundaries } = useCalendar();

  const month = formatDate(selectedDate, "MMMM");
  const year = selectedDate.getFullYear();

  const eventCount = useMemo(
    () => getEventsCount(events, selectedDate, view, weekStartsOn, dayBoundaries),
    [events, selectedDate, view, weekStartsOn, dayBoundaries]
  );

  const handlePrevious = () => setSelectedDate(navigateDate(selectedDate, view, "previous"));
  const handleNext = () => setSelectedDate(navigateDate(selectedDate, view, "next"));

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {month} {year}
        </span>
        <Badge>{eventCount} events</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" onClick={handlePrevious}>
          <ChevronLeft />
        </Button>

        <p className="text-sm text-t-tertiary">{rangeText(view, selectedDate, weekStartsOn)}</p>

        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" onClick={handleNext}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
