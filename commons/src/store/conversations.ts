import { writable } from "svelte/store";
import type {
  Conversation,
  StoredConversation,
  StoredMessage,
} from "@commons/types/Nylas";

function initializeConversations() {
  const { subscribe, set, update } = writable<Record<string, Conversation>>({});
  return {
    subscribe,
    addThread: (incomingThread: StoredConversation) => {
      update((thread) => {
        thread[incomingThread.queryKey] = incomingThread.data;
        return { ...thread };
      });
    },
    updateThread: (incomingThread: StoredConversation) => {
      update((thread) => {
        thread[incomingThread.queryKey] = {
          ...thread[incomingThread.queryKey],
          ...incomingThread.data,
        };
        return { ...thread };
      });
    },
    addMessageToThread: (incomingMessage: StoredMessage) => {
      update((thread) => {
        thread[incomingMessage.queryKey].messages = thread[
          incomingMessage.queryKey
        ].messages.map((_message) => {
          if (_message.id === incomingMessage.data.id) {
            _message = incomingMessage.data;
          }
          return _message;
        });
        return { ...thread };
      });
    },
    reset: () => set({}),
  };
}

export const ConversationStore = initializeConversations();
