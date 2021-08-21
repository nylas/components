import { writable } from "svelte/store";
import { fetchThread } from "../connections/threads";
import type {
  Conversation,
  StoredConversation,
  ConversationQuery,
  StoredMessage,
} from "@commons/types/Nylas";

function initializeConversations() {
  const { subscribe, set, update } = writable<Record<string, Conversation>>({});

  const threadsMap: Record<string, Conversation> = {};

  return {
    subscribe,
    // getConversation: mimicking store/events' getEvents()
    getConversation: async (query: ConversationQuery) => {
      const queryKey = JSON.stringify(query);
      if (!threadsMap[queryKey] && (query.component_id || query.access_token)) {
        threadsMap[queryKey] = await fetchThread(query);
        update((threads) => {
          threads[queryKey] = threadsMap[queryKey];
          return { ...threads };
        });
      }
      return await threadsMap[queryKey];
    },

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
