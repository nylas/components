import { fetchManifest } from "../connections/manifest";
import { Writable, writable } from "svelte/store";

type ManifestAccessor = { component_id: string; access_token?: string };
type ManifestStore = Record<string, Promise<Nylas.Manifest>>;

function initialize(): Writable<ManifestStore> {
  const get = (
    target: ManifestStore,
    key: string,
  ): Promise<Nylas.Manifest> | void => {
    const accessor: ManifestAccessor = JSON.parse(key);

    if (!accessor.component_id) return;

    if (!target[key]) {
      const fetchPromise = fetchManifest(
        accessor.component_id,
        accessor.access_token,
      );
      store.update((store) => ({
        ...store,
        [key]: fetchPromise,
      }));
      target[key] = fetchPromise;
    }
    return target[key];
  };
  const store = writable(new Proxy<ManifestStore>({}, { get }));
  return store;
}

export const ManifestStore = initialize();
