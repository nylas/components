import { writable } from "svelte/store";
import type { CommonQuery, Label, StoredLabels } from "@commons/types/Nylas";
import { fetchLabels } from "@commons/connections/labels";

function initializeLabels() {
  const { subscribe, set, update } = writable<Record<string, Label[]>>({});
  const labelsMap: Record<string, Label[]> = {};

  return {
    subscribe,
    addLabels: (incomingLabels: StoredLabels) => {
      update((labels) => {
        labels[incomingLabels.queryKey] = incomingLabels.data;
        return { ...labels };
      });
    },
    getLabels: async (query: CommonQuery, forceRefresh = false) => {
      const queryKey = JSON.stringify(query);
      if (
        (!labelsMap[queryKey] || forceRefresh) &&
        (query.component_id || query.access_token)
      ) {
        labelsMap[queryKey] = (await fetchLabels(query)).map((label) => {
          label.toString = () => label.id;
          return label;
        });
      }
      update((labels) => {
        labels[queryKey] = labelsMap[queryKey];
        return { ...labels };
      });
      return labelsMap[queryKey];
    },
    reset: () => set({}),
  };
}

export const LabelStore = initializeLabels();
