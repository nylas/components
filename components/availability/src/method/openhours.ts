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
      end: `${endHour}:00`,
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

export function buildOpenHours(
  openHours: AvailabilityRule[],
  events: EventDefinition[],
): OpenHours[] {
  return openHours.map((rule) => ({
    emails: events.flatMap((event) => event.participantEmails),
    days: [rule.startWeekday === 0 ? 6 : rule.startWeekday - 1], // TODO - include endWeekday
    start: `${formatTime(rule.startHour)}:${formatTime(rule.startMinute)}`,
    end: `${formatTime(rule.endHour)}:${formatTime(rule.endMinute)}`,
    timezone: rule.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    object_type: "open_hours",
  }));
}
