import type { EventDefinition } from "@commons/types/ScheduleEditor";
import type { AvailabilityRule, OpenHours } from "@commons/types/Availability";

export function convertHourAssumptionsToOpenHours(
  startHour: number,
  endHour: number,
  events: EventDefinition[],
): OpenHours[] {
  return [
    {
      emails: events.flatMap((event) => event.participantEmails),
      days: [...Array(7).keys()],
      start: `${startHour}:00`,
      end: coerceEndTime({ hour: endHour }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      object_type: "open_hours",
    },
  ];
}

function formatTime(time: number) {
  if (!time) {
    return "00";
  }

  return time.toString().padStart(2, "0");
}

/**
 * Cloud core expects end time range [0, 23)
 * So a time range 0:00 - 24:00 (the full day),
 * which a user might think is a valid range throws an error.
 *
 * The actual range should be 0:00 - 23:59.
 */
function coerceEndTime({
  hour,
  minute = 0,
}: {
  hour: number;
  minute?: number;
}) {
  if (hour >= 24) {
    return `${formatTime(23)}:${formatTime(59)}`;
  }

  return `${formatTime(hour)}:${formatTime(minute)}`;
}

export function buildOpenHours(
  openHours: AvailabilityRule[],
  events: EventDefinition[],
): OpenHours[] {
  return openHours.map((rule) => ({
    emails: events.flatMap((event) => event.participantEmails),
    days: [rule.startWeekday === 0 ? 6 : rule.startWeekday - 1], // TODO - include endWeekday
    start: `${formatTime(rule.startHour)}:${formatTime(rule.startMinute)}`,
    end: coerceEndTime({ hour: rule.endHour, minute: rule.endMinute }),
    timezone: rule.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    object_type: "open_hours",
  }));
}
