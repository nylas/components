import { writable } from "svelte/store";
import type { CommonQuery, Folder, StoredFolders } from "@commons/types/Nylas";
import { fetchFolders } from "@commons/connections/folders";

function initializeFolders() {
  const { subscribe, set, update } = writable<Record<string, Folder[]>>({});
  const foldersMap: Record<string, Folder[]> = {};

  return {
    subscribe,
    getFolders: async (query: CommonQuery, forceRefresh = false) => {
      const queryKey = JSON.stringify(query);
      if (
        (!foldersMap[queryKey] || forceRefresh) &&
        (query.component_id || query.access_token)
      ) {
        foldersMap[queryKey] = (await fetchFolders(query)).map((folder) => {
          folder.toString = () => folder.id;
          return folder;
        });
      }
      update((folders) => {
        folders[queryKey] = foldersMap[queryKey];
        return { ...folders };
      });
      return foldersMap[queryKey];
    },
    reset: () => set({}),
  };
}

export const FolderStore = initializeFolders();
