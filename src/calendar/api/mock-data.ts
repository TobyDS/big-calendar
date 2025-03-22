import type { IDefaultEvent } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";
import { USERS_MOCK } from "@/calendar/mocks";

// Seed data for mock events
const colors: TEventColor[] = ["blue", "indigo", "pink", "red", "orange", "amber", "emerald"];
const titles = [
  "Team meeting", "Project review", "Client call", "Product demo",
  "Planning session", "Weekly sync", "Design review", "Development sprint",
  "Lunch with team", "Performance review", "Training session"
];

// Generate random events within a date range
function generateMockEvents(
  startDate: Date,
  endDate: Date,
  count: number = 20
): IDefaultEvent[] {
  const events: IDefaultEvent[] = [];
  
  // Track busy time slots for each user to avoid overlaps
  const userBusySlots: Record<string, Array<{start: Date, end: Date}>> = {};
  
  // Initialize empty busy slots array for each user
  USERS_MOCK.forEach(user => {
    userBusySlots[user.id] = [];
  });
  
  // Helper function to check if a time slot overlaps with existing events
  const isTimeSlotAvailable = (userId: string, start: Date, end: Date): boolean => {
    const userSlots = userBusySlots[userId];
    return !userSlots.some(slot => 
      (start < slot.end && end > slot.start)
    );
  };
  
  // Helper function to add a busy slot for a user
  const addBusySlot = (userId: string, start: Date, end: Date): void => {
    userBusySlots[userId].push({ start, end });
    // Sort busy slots by start time to make overlap checking more efficient
    userBusySlots[userId].sort((a, b) => a.start.getTime() - b.start.getTime());
  };
  
  let attempts = 0;
  let i = 0;
  
  while (i < count && attempts < count * 10) { // Limit attempts to avoid infinite loops
    attempts++;
    
    // Random date between start and end
    const dateRange = endDate.getTime() - startDate.getTime();
    const randomOffset = Math.random() * dateRange;
    const eventDate = new Date(startDate.getTime() + randomOffset);
    
    // Set to business hours (8am-5pm)
    const hour = 8 + Math.floor(Math.random() * 9);
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
    eventDate.setHours(hour, minute, 0, 0);
    
    // Calculate max possible duration to stay within business hours (5pm)
    const minutesUntil5PM = (17 - hour) * 60 - minute;
    const possibleDurations = [30, 45, 60, 90, 120].filter(d => d <= minutesUntil5PM);
    const durationMinutes = possibleDurations.length > 0 
      ? possibleDurations[Math.floor(Math.random() * possibleDurations.length)]
      : minutesUntil5PM;
    
    const endDateTime = new Date(eventDate);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
    
    // Find an available user for this time slot
    const availableUsers = USERS_MOCK.filter(user => 
      isTimeSlotAvailable(user.id, eventDate, endDateTime)
    );
    
    // If no users are available for this slot, try a different time
    if (availableUsers.length === 0) {
      continue;
    }
    
    // Pick a random available user
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    
    // Register this slot as busy for the selected user
    addBusySlot(randomUser.id, eventDate, endDateTime);
    
    events.push({
      id: `mock-${i}-${Date.now()}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: "This is a mock event generated for testing purposes.",
      startDate: eventDate.toISOString(),
      endDate: endDateTime.toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
      user: randomUser
    });
    
    i++; // Only increment on successful event creation
  }
  
  return events;
}

// In-memory store for persistent mock data
const mockEventStore: IDefaultEvent[] = generateMockEvents(
  new Date(new Date().getFullYear(), 0, 1),
  new Date(new Date().getFullYear(), 11, 31),
  1500 
);

// Export the store for mock API operations
export { mockEventStore };