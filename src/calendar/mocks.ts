import type { TEventColor } from "@/calendar/types";
import type { IEvent, IUser } from "@/calendar/interfaces";

// ================================== //

export const USERS_MOCK: IUser[] = [
  {
    id: "f3b035ac-49f7-4e92-a715-35680bf63175",
    name: "Michael Doe",
    picturePath: null,
  },
  {
    id: "3e36ea6e-78f3-40dd-ab8c-a6c737c3c422",
    name: "Alice Johnson",
    picturePath: null,
  },
  {
    id: "a7aff6bd-a50a-4d6a-ab57-76f76bb27cf5",
    name: "Robert Smith",
    picturePath: null,
  },
  {
    id: "dd503cf9-6c38-43cf-94cc-0d4032e2f77a",
    name: "Emily Davis",
    picturePath: null,
  },
];

// ================================== //

const colors: TEventColor[] = ["blue", "green", "red", "yellow", "purple", "orange"];
const events = [
  "Doctor's appointment",
  "Dental cleaning",
  "Eye exam",
  "Therapy session",
  "Business meeting",
  "Team stand-up",
  "Project deadline",
  "Weekly report submission",
  "Client presentation",
  "Marketing strategy review",
  "Networking event",
  "Sales call",
  "Investor pitch",
  "Board meeting",
  "Employee training",
  "Performance review",
  "One-on-one meeting",
  "Lunch with a colleague",
  "HR interview",
  "Conference call",
  "Web development sprint planning",
  "Software deployment",
  "Code review",
  "QA testing session",
  "Cybersecurity audit",
  "Server maintenance",
  "API integration update",
  "Data backup",
  "Cloud migration",
  "System upgrade",
  "Content planning session",
  "Product launch",
  "Customer support review",
  "Team building activity",
  "Legal consultation",
  "Budget review",
  "Financial planning session",
  "Tax filing deadline",
  "Investor relations update",
  "Partnership negotiation",
  "Medical check-up",
  "Vaccination appointment",
  "Blood donation",
  "Gym workout",
  "Yoga class",
  "Physical therapy session",
  "Nutrition consultation",
  "Personal trainer session",
  "Parent-teacher meeting",
  "School open house",
  "College application deadline",
  "Final exam",
  "Graduation ceremony",
  "Job interview",
  "Internship orientation",
  "Office relocation",
  "Business trip",
  "Flight departure",
  "Hotel check-in",
  "Vacation planning",
  "Birthday party",
  "Wedding anniversary",
  "Family reunion",
  "Housewarming party",
  "Community volunteer work",
  "Charity fundraiser",
  "Religious service",
  "Concert attendance",
  "Theater play",
  "Movie night",
  "Sporting event",
  "Football match",
  "Basketball game",
  "Tennis practice",
  "Marathon training",
  "Cycling event",
  "Fishing trip",
  "Camping weekend",
  "Hiking expedition",
  "Photography session",
  "Art workshop",
  "Cooking class",
  "Book club meeting",
  "Grocery shopping",
  "Car maintenance",
  "Home renovation meeting",
];

const mockGenerator = (numberOfEvents: number): IEvent[] => {
  const result: IEvent[] = [];
  let currentId = 1;

  // Date range: 30 days before and after now
  const now = new Date();
  const startRange = new Date(now);
  startRange.setDate(now.getDate() - 30);
  const endRange = new Date(now);
  endRange.setDate(now.getDate() + 30);

  for (let i = 0; i < numberOfEvents; i++) {
    const startDate = new Date(startRange.getTime() + Math.random() * (endRange.getTime() - startRange.getTime()));

    // Set time between 8 AM and 8 PM
    startDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

    const endDate = new Date(startDate);

    // Same-day event: Add 1-3 hours
    endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 3) + 1);

    result.push({
      id: currentId++,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      title: events[Math.floor(Math.random() * events.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      user: USERS_MOCK[Math.floor(Math.random() * USERS_MOCK.length)],
    });
  }

  return result;
};

export const CALENDAR_ITEMS_MOCK: IEvent[] = mockGenerator(80);
