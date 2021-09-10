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
      ).then((manifest) => {
        if (!accessor.external_manifest_ids) {
          return manifest;
        }

        const filteredIds = accessor.external_manifest_ids.filter((id) => !!id);
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
