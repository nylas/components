import type { OpenHours, TimeSlot } from "@commons/types/Availability";
import type { EventDefinition } from "@commonstypes/ScheduleEditor";
import { timeHour } from "d3-time";

export async function createConsecutiveSlots(
  events: EventDefinition[],
  startDay: Date,
  endDay: Date,
  open_hours: OpenHours[],
  store: Record<string, Promise<TimeSlot[][]>>,
  id: string,
  access_token?: string,
) {
  const emailsList = events.reduce((emails, event) => {
    emails.push(event.email_ids); // TODO: why are we typed to "never" here?
    return emails;
  }, []);
  // Pick the duration_minutes from the first block slot
  // TODO: Need to be updated when API can handle different slot size per meeting
  const duration_minutes = events[0].slot_size;
  const eventDetails = {
    duration_minutes,
    interval_minutes: events[0].slot_size,
    start_time: timeHour(new Date(startDay)).getTime() / 1000,
    end_time: timeHour(new Date(endDay)).getTime() / 1000,
    free_busy: [],
    open_hours: open_hours,
    emails: emailsList,
  };

  const fetchedAvailableSlots = await store[
    JSON.stringify({
      ...{ body: eventDetails, component_id: id, access_token },
      forceReload: true,
    })
  ];
  return fetchedAvailableSlots;
}
