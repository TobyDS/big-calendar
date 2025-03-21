import { mockEventStore } from "@/calendar/api/mock-data";
import type { IDefaultEvent } from "@/calendar/interfaces";

// Simulate network delay
const MOCK_DELAY_MS = 300;

// Define the response type from your API
export interface EventsResponse {
  events: IDefaultEvent[];
}

// Define the parameters for event fetching
export interface FetchEventsParams {
  startDate: string; // ISO string
  endDate: string;   // ISO string
  userId?: string;   // Optional user filter
}

/**
 * Mock implementation of fetchEvents that filters the in-memory store
 */
export async function fetchEvents({
  startDate,
  endDate,
  userId
}: FetchEventsParams): Promise<EventsResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  // Parse dates for comparison
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Filter events based on the date range and user
  const filteredEvents = mockEventStore.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Check date range overlap
    const dateOverlap = eventStart <= end && eventEnd >= start;
    
    // Check user match if specified
    const userMatch = !userId || userId === 'all' || 
                      (event.user && event.user.id === userId);
    
    return dateOverlap && userMatch;
  });
  
  // Sort by start date
  filteredEvents.sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  return { events: filteredEvents };
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