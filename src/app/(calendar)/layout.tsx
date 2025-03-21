import { CalendarProvider } from "@/calendar/contexts/calendar-context";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CalendarProvider weekStartsOn="Monday" dayBoundaries={{ startHour: 8, endHour: 18 }}>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
        {children}
      </div>
    </CalendarProvider>
  );
}
