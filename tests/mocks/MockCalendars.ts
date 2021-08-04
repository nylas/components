import type { Calendar } from "@commons/types/Events";

export const mockAgendaCalendar: Calendar[] = [
  {
    account_id: "mockAccountId",
    description: "this is a mock calendar used for testing",
    id: "mockCalendarId",
    is_primary: true,
    location: null,
    name: "mock-calendar",
    object: "calendar",
    read_only: false,
    timezone: "America/Chicago",
  },
];
