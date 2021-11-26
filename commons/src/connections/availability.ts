import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  ConsecutiveAvailabilityQuery,
  AvailabilityQuery,
  AvailabilityResponse,
  FreeBusyResponse,
  TimeSlot,
  PreDatedTimeSlot,
} from "@commons/types/Availability";
import type { MiddlewareResponse } from "@commons/types/Nylas";
import type { EventDefinition } from "@commons/types/ScheduleEditor";

interface HydratedTimeSlot
  extends Omit<PreDatedTimeSlot, "start_time" | "end_time"> {
  start_time: Date;
  end_time: Date;
}

// TODO: deprecate if we find /calendars/availability to be fully sufficient
export const fetchFreeBusy = async (
  query: AvailabilityQuery,
): Promise<FreeBusyResponse[]> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/calendars/free-busy`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      access_token: query.access_token,
      body: query.body,
    }),
  )
    .then(async (apiResponse) => {
      const json = await handleResponse<MiddlewareResponse<FreeBusyResponse[]>>(
        apiResponse,
      );
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const fetchAvailability = async (
  query: AvailabilityQuery,
): Promise<AvailabilityResponse> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/calendars/availability`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      access_token: query.access_token,
      body: query.body,
    }),
  )
    .then(async (apiResponse) => {
      const json = await handleResponse<
        MiddlewareResponse<AvailabilityResponse>
      >(apiResponse);
      // Normalize response .start and .end to .start_time and .end_time to make up for discrependcy in the Nylas API: https://developer.nylas.com/docs/connectivity/calendar/calendar-availability/#availability-response
      // API story: https://app.shortcut.com/nylas/story/73196/
      json.response.time_slots = json.response.time_slots.map((slot) => {
        slot.start_time = slot.start || 0;
        slot.end_time = slot.end || 0;
        delete slot.start;
        delete slot.end;
        return slot;
      });
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const fetchConsecutiveAvailability = async (
  query: ConsecutiveAvailabilityQuery,
): Promise<HydratedTimeSlot[][]> => {
  return fetch(
    `${getMiddlewareApiUrl(
      query.component_id,
    )}/calendars/availability/consecutive`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      access_token: query.access_token,
      body: query.body,
    }),
  )
    .then(async (apiResponse) => {
      const json = await handleResponse<
        MiddlewareResponse<HydratedTimeSlot[][]>
      >(apiResponse);
      let response =
        json.response?.map((blockSlot) => {
          blockSlot = blockSlot.map((slot: any) => {
            slot.start_time = new Date(slot.start_time * 1000);
            slot.end_time = new Date(slot.end_time * 1000);
            return slot;
          });
          return blockSlot;
        }) || [];
      response = hydrateSlotsToEvents(response, query.body.events);
      response = removeSimultaneousAvailabilityOptions(response);
      return response;
    })
    .catch((error) => handleError(query.component_id, error));
};

// Doing the best we can with what we've got: /calendars/availability/consecutive doesn't return any info other than emails
// and start/end times. This means that if we have to events (EventDefinitions) with the same email addresses? We're shooting in the dark about which is which.
// TODO: allow for an indicator on the API side
function hydrateSlotsToEvents(
  availabilities: HydratedTimeSlot[][],
  events: EventDefinition[],
) {
  return availabilities.map((block) => {
    return block.map((subevent) => {
      return {
        ...subevent,
        ...events.find(
          (eventdef) =>
            eventdef.email_ids.length === subevent.emails.length &&
            eventdef.email_ids.every((email) =>
              subevent.emails.includes(email),
            ),
        ),
      };
    });
  });
}

// We don't want to overburden our users with too much sweet horrible freedom of choice;
// the /calendars/availability/consecutive endpoint returns order permutations with same time slots;
// Cull them down to just the first that exists per timeslot.
function removeSimultaneousAvailabilityOptions(
  availabilities: HydratedTimeSlot[][],
) {
  return availabilities.filter((block, index, self) => {
    let foundIndex = self.findIndex((otherBlock) => {
      return (
        otherBlock[0].start_time.getTime() === block[0].start_time.getTime() &&
        otherBlock[otherBlock.length - 1].end_time.getTime() ===
          block[block.length - 1].end_time.getTime()
      );
    });
    return index === foundIndex;
  });
}
