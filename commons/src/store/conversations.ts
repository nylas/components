import { writable } from "svelte/store";
import { fetchThread } from "../connections/threads";
import type {
  Conversation,
  StoredConversation,
  ConversationQuery,
  StoredMessage,
} from "@commons/types/Nylas";
import { silence } from "@commons";

function initializeConversations() {
  const { subscribe, set, update } = writable<Record<string, Conversation>>({});

  const threadsMap: Record<string, Conversation> = {};

  return {
    subscribe,
    // getConversation: mimicking store/events' getEvents()
    getConversation: async (query: ConversationQuery) => {
      const queryKey = JSON.stringify(query);
      if (!threadsMap[queryKey] && (query.component_id || query.access_token)) {
        const thread = await fetchThread(query).catch(silence);

        if (thread) {
          threadsMap[queryKey] = thread;

          update((threads) => {
            threads[queryKey] = threadsMap[queryKey];
            return { ...threads };
          });
        }
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
        let foundMessage = thread[incomingMessage.queryKey].messages?.find(
          (message) => message.id === incomingMessage.data.id,
        );
        if (foundMessage) {
          foundMessage = incomingMessage.data;
        } else {
          const messages = thread[incomingMessage.queryKey].messages;
          messages.push(incomingMessage.data);
          thread[incomingMessage.queryKey].messages = messages;
        }
        return { ...thread };
      });
      return threadsMap[incomingMessage.queryKey];
    },
    reset: () => set({}),
  };
}

export const ConversationStore = initializeConversations();
