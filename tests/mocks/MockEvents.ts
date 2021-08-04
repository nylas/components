import type { TimespanEvent } from "@commons/types/Events";

export const mockEvents = <Partial<TimespanEvent>[]>[
  {
    id: "abc123",
    title: "Brush teeth",
    when: {
      start_time: 555555550,
      end_time: 555555500,
    },
  },
  {
    id: "def456",
    title: "Wash hands",
    when: {
      start_time: 555555500,
      end_time: 555555800,
    },
  },
  {
    id: "ghi789",
    title: "Party time",
    when: {
      start_time: 555555200,
      end_time: 555555800,
    },
  },
];
