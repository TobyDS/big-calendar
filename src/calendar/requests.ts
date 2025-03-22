import { USERS_MOCK } from "@/calendar/mocks";
import { mockEventStore } from "@/calendar/api/mock-data";

const DELAY_MS = 1500;

export const getEvents = async (startDate?: Date, endDate?: Date) => {
  // Increase the delay to better see the loading state
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  
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
};

export const getUsers = async () => {
  // Increase the delay to better see the loading state
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  return USERS_MOCK;
};
