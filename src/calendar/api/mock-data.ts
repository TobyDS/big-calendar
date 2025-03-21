import { addDays, subDays } from "date-fns";
import type { IDefaultEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

// Seed data for mock events
const colors: TEventColor[] = ["blue", "indigo", "pink", "red", "orange", "amber", "emerald"];
const titles = [
  "Team meeting", "Project review", "Client call", "Product demo",
  "Planning session", "Weekly sync", "Design review", "Development sprint",
  "Lunch with team", "Performance review", "Training session"
];

// Generate random events within a date range
export function generateMockEvents(
  startDate: Date,
  endDate: Date,
  count: number = 20
): IDefaultEvent[] {
  const events: IDefaultEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    // Random date between start and end
    const dateRange = endDate.getTime() - startDate.getTime();
    const randomOffset = Math.random() * dateRange;
    const eventDate = new Date(startDate.getTime() + randomOffset);
    
    // Set to business hours (8am-6pm)
    const hour = 8 + Math.floor(Math.random() * 10);
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
    eventDate.setHours(hour, minute, 0, 0);
    
    // Duration between 30 mins and 2 hours
    const durationMinutes = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)];
    const endDateTime = new Date(eventDate);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
    
    events.push({
      id: `mock-${i}-${Date.now()}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: "This is a mock event generated for testing purposes.",
      startDate: eventDate.toISOString(),
      endDate: endDateTime.toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
      user: Math.random() > 0.7 ? {
        id: `user-${Math.floor(Math.random() * 4) + 1}`,
        name: `Test User ${Math.floor(Math.random() * 4) + 1}`,
        picturePath: null
      } : undefined
    });
  }
  
  return events;
}

// In-memory store for persistent mock data
const mockEventStore: IDefaultEvent[] = generateMockEvents(
  subDays(new Date(), 60), // 60 days in the past
  addDays(new Date(), 60),  // 60 days in the future
  100 // 100 initial events
);

// Export the store for mock API operations
export { mockEventStore };