import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  AvailabilityQuery,
  AvailabilityResponse,
  FreeBusyResponse,
  TimeSlot,
} from "@commons/types/Availability";
import type { MiddlewareResponse } from "@commons/types/Nylas";

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
