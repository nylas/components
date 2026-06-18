import { fetchManifest } from "../connections/manifest";
import { Writable, writable } from "svelte/store";
import type { Manifest } from "@commons/types/Nylas";

type ManifestAccessor = {
  component_id: string;
  access_token?: string;
  external_manifest_ids?: [];
};
type ManifestStore = Record<string, Promise<Manifest>>;

function initialize(): Writable<ManifestStore> {
  const get = (
    target: ManifestStore,
    key: string,
  ): Promise<Manifest> | void => {
    const accessor: ManifestAccessor = JSON.parse(key);

    if (!accessor.component_id) return;

    if (!target[key]) {
      const fetchPromise = fetchManifest(
        accessor.component_id,
        accessor.access_token,
      );
      store.update((store) => {
        store[key] = fetchPromise;
        return store;
      });
      target[key] = fetchPromise;
    }
    return target[key];
  };
  const store = writable(new Proxy<ManifestStore>({}, { get }));
  return store;
}

export const ManifestStore = initialize();

/**
 * Invalidate a cached manifest entry so the next access triggers a fresh fetch.
 * Call after saving a manifest to prevent stale data on re-mount.
 */
export function invalidateManifestCache(componentId: string, accessToken?: string): void {
  const key = JSON.stringify({ component_id: componentId, access_token: accessToken });
  ManifestStore.update((store) => {
    // The store wraps a Proxy whose underlying target holds cached promises.
    // Deleting the key from the store object causes the Proxy get-trap to
    // re-fetch on the next access.
    delete (store as Record<string, unknown>)[key];
    return store;
  });
}
