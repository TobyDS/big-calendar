import { mockEventStore } from "@/calendar/api/mock-data";
import type { IDefaultEvent } from "@/calendar/interfaces";

// Simulate network delay
const MOCK_DELAY_MS = 300;

/**
 * Mock implementation of fetchEvents that filters the in-memory store
 */
export async function getEvents(startDate?: Date, endDate?: Date): Promise<IDefaultEvent[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  if (!startDate || !endDate) {
    return mockEventStore;
  }
  
  // Filter events that fall within the given date range
  return mockEventStore.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Event starts before or during the range AND ends during or after the range
    return (eventStart <= endDate && eventEnd >= startDate);
  });
}

/**
 * Mock implementation of createEvent that adds to the in-memory store
 */
export async function createEvent(
  eventData: Omit<IDefaultEvent, "id">
): Promise<IDefaultEvent> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  // Generate a new ID
  const newId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Create the new event
  const newEvent: IDefaultEvent = {
    ...eventData,
    id: newId,
  };
  
  // Add to mock store
  mockEventStore.push(newEvent);
  
  return newEvent;
}

/**
 * Mock implementation of updateEvent
 */
export async function updateEvent(
  eventId: string,
  eventData: Partial<Omit<IDefaultEvent, "id">>
): Promise<IDefaultEvent> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  // Find the event
  const eventIndex = mockEventStore.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    throw new Error(`Event with ID ${eventId} not found`);
  }
  
  // Update the event
  const updatedEvent = {
    ...mockEventStore[eventIndex],
    ...eventData
  };
  
  // Replace in store
  mockEventStore[eventIndex] = updatedEvent;
  
  return updatedEvent;
}

/**
 * Mock implementation of deleteEvent
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  // Find the event
  const eventIndex = mockEventStore.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    throw new Error(`Event with ID ${eventId} not found`);
  }
  
  // Remove from store
  mockEventStore.splice(eventIndex, 1);
  
  return { success: true };
}