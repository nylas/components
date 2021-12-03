import type { OpenHours, TimeSlot } from "@commons/types/Availability";
import type { EventDefinition } from "@commonstypes/ScheduleEditor";
import { timeHour } from "d3-time";

export interface createConsecutiveSlotsQuery {
  events: EventDefinition[];
  dayRange: Date[];
  startHour: number;
  endHour: number;
  openHours: OpenHours[];
}

export async function createConsecutiveSlots(
  query: createConsecutiveSlotsQuery,
) {
  const { events, dayRange, startHour, endHour, openHours } = query;
  const startDay = dayRange[0];
  const endDay = dayRange[dayRange.length - 1];

  const emailsList = events.reduce((emails, event) => {
    emails.push(event.participants); // TODO: why are we typed to "never" here?
    return emails;
  }, []);
  // Pick the duration_minutes from the first block slot
  // TODO: Need to be updated when API can handle different slot size per meeting
  const duration_minutes = events[0].slot_size;
  const eventDetails = {
    duration_minutes,
    interval_minutes: events[0].slot_size,
    start_time:
      timeHour(new Date(new Date(startDay).setHours(startHour))).getTime() /
      1000,
    end_time:
      timeHour(new Date(new Date(endDay).setHours(endHour))).getTime() / 1000,
    free_busy: [],
    open_hours: openHours,
    emails: emailsList,
    events,
  };
  return eventDetails;
}
