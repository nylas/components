import { writable } from "svelte/store";
import type { Message, StoredMessages } from "@commons/types/Nylas";

function initializeMessages() {
  const { subscribe, set, update } = writable<Record<string, Message[]>>({});
  return {
    subscribe,
    addMessages: (incomingMessages: StoredMessages) => {
      update((messages) => {
        messages[incomingMessages.queryKey] = incomingMessages.data;
        return { ...messages };
      });
    },
    reset: () => set({}),
  };
}

export const MessageStore = initializeMessages();
