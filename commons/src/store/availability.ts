import { Writable, writable } from "svelte/store";
import { fetchAvailability } from "../connections/availability";
import type {
  AvailabilityQuery,
  AvailabilityResponse,
} from "@commons/types/Availability";

type AvailabilityStore = Record<string, Promise<AvailabilityResponse>>;

function initialize(): Writable<AvailabilityStore> {
  const get = (
    target: AvailabilityStore,
    key: string,
  ): Promise<AvailabilityResponse> | void => {
    const accessor: AvailabilityQuery = JSON.parse(key);
    // Avoid saving forceReload property as part of store key
    const accessorCopy = { ...accessor };
    delete accessorCopy.forceReload;
    key = JSON.stringify(accessorCopy);

    if (
      !accessor.component_id ||
      !accessor?.body?.start_time ||
      !accessor?.body?.end_time
    ) {
      return;
    }

    if (!target[key] || accessor.forceReload) {
      const fetchPromise = fetchAvailability(accessor);
      store.update((store) => {
        store[key] = fetchPromise;
        return store;
      });
      target[key] = fetchPromise;
    }
    return target[key];
  };
  const store = writable(new Proxy<AvailabilityStore>({}, { get }));
  return store;
}

export const AvailabilityStore = initialize();
