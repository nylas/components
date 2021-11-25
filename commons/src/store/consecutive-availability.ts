import { Writable, writable } from "svelte/store";
import { fetchConsecutiveAvailability } from "../connections/availability";
import type { AvailabilityQuery, TimeSlot } from "@commons/types/Availability";

type ConsecutiveAvailabilityStore = Record<string, Promise<TimeSlot[][]>>;

function initialize(): Writable<ConsecutiveAvailabilityStore> {
  const get = (
    target: ConsecutiveAvailabilityStore,
    key: string,
  ): Promise<TimeSlot[][]> | void => {
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
      console.log("am I getting here?: ", accessor.body);
      return;
    }

    if (!target[key] || accessor.forceReload) {
      const fetchPromise = fetchConsecutiveAvailability(accessor);
      store.update((store) => {
        store[key] = fetchPromise;
        return store;
      });
      target[key] = fetchPromise;
    }
    return target[key];
  };
  const store = writable(new Proxy<ConsecutiveAvailabilityStore>({}, { get }));
  return store;
}

export const ConsecutiveAvailabilityStore = initialize();
