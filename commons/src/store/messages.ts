import { writable } from "svelte/store";

function initializeMessages() {
  const { subscribe, set, update } = writable<Record<string, Nylas.Message[]>>(
    {},
  );
  return {
    subscribe,
    addMessages: (incomingMessages: Nylas.StoredMessages) => {
      update((messages) => {
        messages[incomingMessages.queryKey] = incomingMessages.data;
        return { ...messages };
      });
    },
    reset: () => set({}),
  };
}

export const MessageStore = initializeMessages();
