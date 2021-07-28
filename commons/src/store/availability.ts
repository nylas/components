import { writable } from "svelte/store";
import { fetchAvailability } from "../connections/availability";

function initializeAvailability() {
  const { subscribe, update, set } = writable<
    Record<string, Promise<Availability.AvailabilityResponse[]>>
  >({});
  let availabilityMap: Record<
    string,
    Promise<Availability.AvailabilityResponse[]>
  > = {};

  return {
    subscribe,
    getAvailability: async (query: Availability.AvailabilityQuery) => {
      const queryKey = JSON.stringify(query);
      if (
        !availabilityMap[queryKey] &&
        (query.component_id || query.access_token)
      ) {
        availabilityMap[queryKey] = fetchAvailability(query);
        update((availability) => {
          availability[queryKey] = availabilityMap[queryKey];
          return { ...availability };
        });
      }

      return await availabilityMap[queryKey];
    },
    reset: () => {
      availabilityMap = {};
      set({});
    },
  };
}

export const AvailabilityStore = initializeAvailability();
