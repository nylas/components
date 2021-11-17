import { derived, writable } from "svelte/store";
import { createEvent, fetchEvents } from "../connections/events";
import type { EventQuery, Event } from "@commons/types/Events";

function initializeEvents() {
  const { subscribe, update, set } = writable<Record<string, Promise<Event[]>>>(
    {},
  );
  let eventsMap: Record<string, Promise<Event[]>> = {};

  return {
    subscribe,
    getEvents: async (query: EventQuery) => {
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
        console.log('!!!!!!!1', await eventsMap[queryKey]);

        return await eventsMap[queryKey];
      }
    },
    createEvent: async (event: Event, query: EventQuery) => {
      const queryKey = JSON.stringify(query);
      const _event = await eventsMap[queryKey];
      if (_event) {
        eventsMap[queryKey] = Promise.all([
          eventsMap[queryKey],
          createEvent(event, query),
        ]).then((events) => {
          return events.flat();
        });
      } else {
        eventsMap[queryKey] = createEvent(event, query).then((event) => {
          return [event];
        });
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

export const AllDayEvents = derived(EventStore, async ($events) => {
  return await Promise.all(Object.values($events)).then(x => {
    return x.flat().filter((event) => event.when?.date);
  })
})