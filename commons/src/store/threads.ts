import { derived, writable } from "svelte/store";
import { fetchThread, fetchThreads } from "../connections/threads";

function initializeThreads() {
  const { subscribe, set, update } = writable<Record<string, Nylas.Thread[]>>(
    {},
  );
  let threadsMap: Record<string, Nylas.Thread[]> = {};

  return {
    subscribe,
    set,
    getThreads: async (query: Nylas.MailboxQuery, forceRefresh = false) => {
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

    getThread: async (query: Nylas.ConversationQuery) => {
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

    reset: () => {
      threadsMap = {};
      set({});
    },

    // addThreads: (incomingThreads: Nylas.StoredThreads) => {
    //   update((threads) => {
    //     threads[incomingThreads.queryKey] = incomingThreads.data;
    //     return { ...threads };
    //   });
    // },

    hydrateMessageInThread: (
      incomingMessage: Nylas.Message,
      query: Nylas.MailboxQuery,
    ) => {
      const queryKey = JSON.stringify(query);
      const foundThread = threadsMap[queryKey].find(
        (thread) => thread.id === incomingMessage.thread_id,
      );
      if (foundThread) {
        foundThread.messages.find(
          (message) => message.id === incomingMessage.id,
        ).body = incomingMessage.body;
      }
      update((threads) => {
        threads[incomingMessage.thread_id] = JSON.parse(
          JSON.stringify(foundThread),
        );
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
