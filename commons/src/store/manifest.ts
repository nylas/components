import { fetchManifest } from "../connections/manifest";
import { Writable, writable } from "svelte/store";
import type { Manifest } from "@commons/types/Nylas";

type ManifestAccessor = { component_id: string; access_token?: string };
type ManifestStore = Record<string, Promise<Manifest>>;

function initialize() {
  const { subscribe, update, set } = writable(new Proxy<ManifestStore>({}, {}));
  let manifestMap: ManifestStore = {};

  return {
    subscribe,
    get: (key: string): Promise<Manifest> | void => {
      const accessor: ManifestAccessor = JSON.parse(key);

      if (!accessor.component_id) return;

      if (!manifestMap[key]) {
        const fetchPromise = fetchManifest(
          accessor.component_id,
          accessor.access_token,
        );
        update((store) => ({
          ...store,
          [key]: fetchPromise,
        }));
        manifestMap[key] = fetchPromise;
      }
      return manifestMap[key];
    },
    getAndMerge: async (key: string, ...otherManifestIds: string[]) => {
      const accessor: ManifestAccessor = JSON.parse(key);

      if (!accessor.component_id) return;

      // TODO - handle case where manifest was already loaded using `get` so it isn't merged yet
      if (!manifestMap[key]) {
        const fetchPromise = fetchManifest(
          accessor.component_id,
          accessor.access_token,
        ).then((manifest) => {
          const filteredIds = otherManifestIds.filter((id) => !!id);
          if (filteredIds.length === 0) {
            return manifest;
          }

          const mergeManifestPromises = [];
          for (const manifestId of filteredIds) {
            mergeManifestPromises.push(
              fetchManifest(manifestId, accessor.access_token),
            );
          }

          return Promise.all(mergeManifestPromises).then((manifestsToMerge) => {
            // TODO - not sure if this is exactly how we want to merge
            return Object.assign({}, manifest, ...manifestsToMerge);
          });
        });
        update((store) => ({
          ...store,
          [key]: fetchPromise,
        }));
        manifestMap[key] = fetchPromise;
      }
      return manifestMap[key];
    },
    reset: () => {
      manifestMap = {};
      set({});
    },
  };
}

export const ManifestStore = initialize();
