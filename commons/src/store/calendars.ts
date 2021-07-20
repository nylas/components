import { writable } from "svelte/store";
import { fetchCalendars } from "../connections/events";

function initializeCalendars() {
  const { subscribe, update, set } = writable<
    Record<string, Promise<Events.Calendar[]>>
  >({});
  let calendarMap: Record<string, Promise<Events.Calendar[]>> = {};

  return {
    subscribe,
    getCalendars: async (query: Events.CalendarQuery) => {
      const queryKey = JSON.stringify(query);
      if (!calendarMap[queryKey] && (query.component_id || query.access_token)) {
        calendarMap[queryKey] = fetchCalendars(query);
        update((calendars) => {
          calendars[queryKey] = calendarMap[queryKey];
          return { ...calendars };
        });
      }

      return await calendarMap[queryKey];
    },
    reset: () => {
      calendarMap = {};
      set({});
    },
  };
}

export const CalendarStore = initializeCalendars();
