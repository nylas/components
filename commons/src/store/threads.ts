import { derived, writable } from "svelte/store";
import { fetchThread, fetchThreads } from "../connections/threads";
import type {
  Thread,
  MailboxQuery,
  ConversationQuery,
  Message,
} from "@commons/types/Nylas";

function initializeThreads() {
  const { subscribe, set, update } = writable<Record<string, Thread[]>>({});
  let threadsMap: Record<string, Thread[]> = {};

  return {
    subscribe,
    set,
    getThreads: async (query: MailboxQuery, forceRefresh = false) => {
      const queryKey = JSON.stringify(query);
      if (
        (!threadsMap[queryKey] || forceRefresh) &&
        (query.component_id || query.access_token)
      ) {
        threadsMap[queryKey] = (await fetchThreads(query)).map((thread) => {
          thread.toString = () => thread.id;
          return thread;
        });
      }
      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey];
    },

    getThread: async (query: ConversationQuery) => {
      const queryKey = JSON.stringify(query);
      if (!threadsMap[queryKey] && (query.component_id || query.access_token)) {
        threadsMap[queryKey] = [await fetchThread(query)];
      }
      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey];
    },

    deleteThreads: async (
      query: MailboxQuery,
      threadsToDelete: Set<Thread>,
    ) => {
      const queryKey = JSON.stringify(query);
      if (!threadsMap[queryKey] && (query.component_id || query.access_token)) {
        threadsMap[queryKey] = (await fetchThreads(query)).map((thread) => {
          thread.toString = () => thread.id;
          return thread;
        });
      }
      update((threads) => {
        threadsToDelete.forEach((thread) => {
          const deleteIndex = threadsMap[queryKey].indexOf(thread);
          threadsMap[queryKey].splice(deleteIndex, deleteIndex + 1);
        });
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey];
    },

    reset: () => {
      threadsMap = {};
      set({});
    },

    // addThreads: (incomingThreads: StoredThreads) => {
    //   update((threads) => {
    //     threads[incomingThreads.queryKey] = incomingThreads.data;
    //     return { ...threads };
    //   });
    // },

    hydrateMessageInThread: (incomingMessage: Message, query: MailboxQuery) => {
      const queryKey = JSON.stringify(query);
      const foundThread = threadsMap[queryKey].find(
        (thread) => thread.id === incomingMessage.thread_id,
      );
      if (foundThread) {
        const foundMessage = foundThread?.messages?.find(
          (message) => message.id === incomingMessage.id,
        );
        if (foundMessage) {
          foundMessage.body = incomingMessage.body;
        }
      }
      update((threads) => {
        if (incomingMessage.thread_id) {
          threads[incomingMessage.thread_id] = JSON.parse(
            JSON.stringify(foundThread),
          );
        }
        return { ...threads };
      });
      return threadsMap[JSON.stringify(query)];
    },
  };
}

export const MailboxStore = initializeThreads();

export const Threads = derived(MailboxStore, ($mailboxes) => {
  // console.log('Threads deriving', $mailboxes);
  return Object.values($mailboxes).flat();
});
