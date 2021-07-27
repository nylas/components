import { writable } from "svelte/store";
import { createEvent, fetchEvents } from "../connections/events";

function initializeEvents() {
  const { subscribe, update, set } = writable<
    Record<string, Promise<Events.Event[]>>
  >({});
  let eventsMap: Record<string, Promise<Events.Event[]>> = {};

  return {
    subscribe,
    getEvents: async (query: Events.EventQuery) => {
      if (Array.isArray(query.calendarIDs) && query.calendarIDs.length > 0) {
        const queryKey = JSON.stringify(query);
        if (
          !eventsMap[queryKey] &&
          (query.component_id || query.access_token)
        ) {
          eventsMap[queryKey] = fetchEvents(query);
          update((events) => {
            events[queryKey] = eventsMap[queryKey];
            return { ...events };
          });
        }
        return await eventsMap[queryKey];
      }
    },
    createEvent: (
      event: Events.Event,
      query: Events.EventQuery,
      component: "agenda" | "availability" = "agenda",
    ) => {
      const queryKey = JSON.stringify(query);
      if (!!eventsMap[queryKey]) {
        eventsMap[queryKey] = Promise.all([
          eventsMap[queryKey],
          createEvent(event, query),
        ]).then((events) => {
          return events.flat();
        });
      } else {
        eventsMap[queryKey] = createEvent(event, query, component).then(
          (event) => {
            return [event];
          },
        );
      }

      update((events) => {
        events[queryKey] = eventsMap[queryKey];
        return { ...events };
      });
    },
    reset: () => {
      eventsMap = {};
      set({});
    },
  };
}

export const EventStore = initializeEvents();
