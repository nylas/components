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
} from "@commons/types/Availability";
import type { MiddlewareResponse } from "@commons/types/Nylas";

export const fetchAvailability = async (
  query: AvailabilityQuery,
): Promise<FreeBusyResponse[]> => {
  console.log("fetchin avail for", query);
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

export const fetchAvailabilityNew = async (
  // TODO: rename
  query: AvailabilityQuery,
): Promise<AvailabilityResponse[]> => {
  console.log("fetchin avail for", query);
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
        MiddlewareResponse<AvailabilityResponse[]>
      >(apiResponse);
      console.log("responsy", json.response);
      // Normalize response .start and .end to .start_time and .end_time to make up for discrependcy in the Nylas API: https://developer.nylas.com/docs/connectivity/calendar/calendar-availability/#availability-response
      // API story: https://app.shortcut.com/nylas/story/73196/
      json.response.time_slots = json.response.time_slots.map((s) => {
        s.start_time = s.start;
        s.end_time = s.end;
        delete s.start;
        delete s.end;
        return s;
      });
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
