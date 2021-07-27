import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const fetchEvents = async (
  query: Events.EventQuery,
): Promise<Events.Event[]> => {
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
          handleResponse<Nylas.MiddlewareResponse<Events.Event[]>>(response),
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
  query: Events.CalendarQuery,
): Promise<Events.Calendar[]> => {
  return Promise.all(
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
          handleResponse<Nylas.MiddlewareResponse<Events.Calendar[]>>(response),
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

export async function createEvent(
  event: Events.Event,
  query: Events.EventQuery,
  component: "agenda" | "availability" = "agenda",
): Promise<Events.Event> {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id || "")}/${component}/events`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      access_token: query.access_token,
      body: event,
    }),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Events.Event>>(response),
    )
    .then((json) => {
      return json.response;
    });
}
