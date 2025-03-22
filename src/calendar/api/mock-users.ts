import type { IDefaultUser } from "@/calendar/interfaces";
import { USERS_MOCK } from "@/calendar/mocks";

// Simulate network delay
const MOCK_DELAY_MS = 300;

// Use the same mock users as defined in mocks.ts
const mockUsers: IDefaultUser[] = USERS_MOCK;

/**
 * Mock implementation of getUsers
 * Simulates an API request to fetch users
 */
export async function getUsers(): Promise<IDefaultUser[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  return [...mockUsers];
}