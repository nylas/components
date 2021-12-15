import { writable } from "svelte/store";
import type { File, Message } from "@commons/types/Nylas";
import { downloadFile } from "@commons/connections/files";

function initializeFilesForMessage() {
  const { subscribe, set, update } = writable<
    Record<string, Record<string, File>>
  >({});
  const filesMap: Record<string, Record<string, File>> = {}; // {message_id: {file_id: Base64 String}}

  return {
    subscribe,
    getFilesForMessage: async (
      incomingMessage: Message,
      query: { component_id: string; access_token: string },
    ) => {
      if (!filesMap[incomingMessage.id]) {
        const inlineFiles: Record<string, File> = {};
        for (const file of incomingMessage.files.values()) {
          // treat all files with content_id as inline
          if (
            (file.content_disposition === "inline" || file.content_id) &&
            !inlineFiles[file.id]
          ) {
            inlineFiles[file.id] = file;
            inlineFiles[file.id].data = await downloadFile({
              file_id: file.id,
              component_id: query.component_id,
              access_token: query.access_token,
            });
          }
        }
        filesMap[incomingMessage.id] = inlineFiles;
        update((files) => {
          files[incomingMessage.id] = inlineFiles;
          return { ...files };
        });
      }
      return filesMap[incomingMessage.id];
    },
    hasInlineFiles: (incomingMessage: Message): boolean => {
      return incomingMessage?.files?.some(
        (file) => file.content_disposition === "inline" || file.content_id,
      );
    },
    reset: () => set({}),
  };
}

export const FilesStore = initializeFilesForMessage();
