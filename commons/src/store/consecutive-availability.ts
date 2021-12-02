import { Writable, writable } from "svelte/store";
import { fetchConsecutiveAvailability } from "../connections/availability";
import type {
  AvailabilityQuery,
  ConsecutiveAvailabilityQuery,
  TimeSlot,
} from "@commons/types/Availability";
import type { ConsecutiveEvent } from "@commonstypes/Scheduler";

type ConsecutiveAvailabilityStore = Record<
  string,
  Promise<ConsecutiveEvent[][]>
>;

function initialize(): Writable<ConsecutiveAvailabilityStore> {
  const get = (
    target: ConsecutiveAvailabilityStore,
    key: string,
  ): Promise<ConsecutiveEvent[][]> | void => {
    const accessor: ConsecutiveAvailabilityQuery = JSON.parse(key);
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
