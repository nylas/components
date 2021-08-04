import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type { MiddlewareResponse } from "@commons/types/Nylas";
import type {
  EventQuery,
  Event,
  CalendarQuery,
  Calendar,
} from "@commons/types/Events";

export const fetchEvents = async (query: EventQuery): Promise<Event[]> => {
  return Promise.all(
    query.calendarIDs.map((calendar) => {
      return fetch(
        `${getMiddlewareApiUrl(
          query.component_id || "",
        )}/agenda/events?calendar_id=${calendar}&starts_after=${
          query.starts_after - 1
        }&ends_before=${query.ends_before}&expand_recurring=true`,
        getFetchConfig({
          component_id: query.component_id,
          access_token: query.access_token,
        }),
      )
        .then((response) =>
          handleResponse<MiddlewareResponse<Event[]>>(response),
        )
        .then((json) => {
          return json.response;
        });
    }),
  )
    .then((responses) => {
      return responses.flat();
    })
    .catch((error) => handleError(query.component_id || "unknown", error));
};

export const fetchCalendars = async (
  query: CalendarQuery,
): Promise<Calendar[]> => {
  return Promise.allSettled(
    query.calendarIDs.map((calendar: unknown) => {
      return fetch(
        `${getMiddlewareApiUrl(
          query.component_id || "",
        )}/calendars/${calendar}`,
        getFetchConfig({
          component_id: query.component_id,
          access_token: query.access_token,
        }),
      )
        .then((response) =>
          handleResponse<MiddlewareResponse<Calendar[]>>(response),
        )
        .then((json) => {
          return json.response;
        });
    }),
  )
    .then((responses) => {
      const filteredResponses = responses
        .filter((calendar) => calendar.status === "fulfilled")
        .map((cal) => cal.value);
      return filteredResponses.flat();
    })
    .catch((error) => handleError(query.component_id || "unknown", error));
};

export async function createEvent(
  event: Event,
  query: EventQuery,
): Promise<Event> {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id || "")}/agenda/events`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      access_token: query.access_token,
      body: event,
    }),
  )
    .then((response) => handleResponse<MiddlewareResponse<Event>>(response))
    .then((json) => {
      return json.response;
    });
}
