import type { IDefaultUser } from "@/calendar/interfaces";

// Simulate network delay
const MOCK_DELAY_MS = 300;

// Mock users for testing
export const mockUsers: IDefaultUser[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    picturePath: null,
  },
  {
    id: "user-2",
    name: "Michael Chen",
    picturePath: null,
  },
  {
    id: "user-3",
    name: "Alicia Rodriguez",
    picturePath: null,
  },
  {
    id: "user-4",
    name: "David Kim",
    picturePath: null,
  }
];

/**
 * Mock implementation of getUsers
 * Simulates an API request to fetch users
 */
export async function getUsers(): Promise<IDefaultUser[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  return [...mockUsers];
}