import { CALENDAR_ITEMS_MOCK, USERS_MOCK } from "@/calendar/mocks";

const DELAY_MS = 1500;

export const getEvents = async () => {
  // Increase the delay to better see the loading state
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  return CALENDAR_ITEMS_MOCK;
};

export const getUsers = async () => {
  // Increase the delay to better see the loading state
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  return USERS_MOCK;
};
