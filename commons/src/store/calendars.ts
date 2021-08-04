import { writable } from "svelte/store";
import { fetchCalendars } from "../connections/events";
import type { CalendarQuery, Calendar } from "@commons/types/Events";

function initializeCalendars() {
  const { subscribe, update, set } = writable<
    Record<string, Promise<Calendar[]>>
  >({});
  let calendarMap: Record<string, Promise<Calendar[]>> = {};

  return {
    subscribe,
    getCalendars: async (query: CalendarQuery) => {
      const queryKey = JSON.stringify(query);
      if (
        !calendarMap[queryKey] &&
        (query.component_id || query.access_token)
      ) {
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
