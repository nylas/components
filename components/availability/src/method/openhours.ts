import type { EventDefinition } from "@commons/types/ScheduleEditor";
import type { OpenHours } from "@commons/types/Availability";

export function convertHourAssumptionsToOpenHours(
  start_hour: number,
  end_hour: number,
  events: EventDefinition[],
): OpenHours[] {
  return [
    {
      emails: events.flatMap((e) => e.email_ids),
      days: [...Array(7).keys()],
      start: `${start_hour}:00`,
      end: `${end_hour}:00`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      object_type: "open_hours",
    },
  ];
}
