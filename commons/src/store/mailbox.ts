import { derived, Readable, writable } from "svelte/store";
import {
  fetchThreads,
  fetchSearchResultThreads,
  updateThread,
  fetchThreadCount,
} from "../connections/threads";
import type {
  Thread,
  MailboxQuery,
  ConversationQuery,
  Message,
  Conversation,
} from "@commons/types/Nylas";

interface PaginatedThreads {
  isLoaded: boolean;
  threads: Thread[];
}

async function initializePaginatedThreads(totalPages: number) {
  const paginatedThreads = [];

  for (let i = 0; i < totalPages; i++) {
    paginatedThreads.push({
      isLoaded: false,
      threads: [],
    });
  }
  return paginatedThreads;
}

function initializeThreads() {
  const { subscribe, set, update } = writable<
    Record<string, PaginatedThreads[]>
  >({});
  let threadsMap: Record<string, PaginatedThreads[]> = {};
  let totalItems: number;

  return {
    subscribe,
    set,
    getThreads: async (
      query: MailboxQuery,
      currentPage: number,
      pageSize: number,
      forceRefresh = false,
    ) => {
      const queryKey = JSON.stringify(query);
      if (!query.component_id && !query.access_token) {
        return [];
      }

      if (totalItems === undefined || forceRefresh) {
        totalItems = await fetchThreadCount(query);
      }

      if (!Array.isArray(threadsMap[queryKey]) || forceRefresh) {
        const totalPages = Math.ceil(totalItems / pageSize);
        threadsMap[queryKey] = await initializePaginatedThreads(totalPages);
      }

      if (!threadsMap[queryKey][currentPage].isLoaded) {
        threadsMap[queryKey][currentPage].threads = await fetchThreads(
          query,
          pageSize,
          currentPage * pageSize,
        );
        threadsMap[queryKey][currentPage].isLoaded = true;
      }

      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey][currentPage].threads;
    },
    getNumberOfItems: async (query: MailboxQuery) => {
      if (!query.component_id && !query.access_token) {
        return 0;
      }

      if (totalItems === undefined) {
        totalItems = await fetchThreadCount(query);
      }
      return totalItems;
    },
    // TODO - Use real pagination when search endpoint supports it
    getThreadsWithSearchKeyword: async (
      query: MailboxQuery,
      forceRefresh = false,
    ) => {
      if (!query.component_id && !query.access_token) {
        return [];
      }
      const queryKey = JSON.stringify(query);

      if (!Array.isArray(threadsMap[queryKey]) || forceRefresh) {
        threadsMap[queryKey] = await initializePaginatedThreads(1);
      }

      if (!threadsMap[queryKey][0].isLoaded || forceRefresh) {
        threadsMap[queryKey][0].threads = await fetchSearchResultThreads(query);
        threadsMap[queryKey][0].isLoaded = true;
      }
      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey][0].threads;
    },
    updateThread: async (
      threadQuery: ConversationQuery,
      queryKey: string,
      updatedThread: Conversation,
      currentPage: number,
      pageSize: number,
    ) => {
      const thread = await updateThread(threadQuery, updatedThread);
      if (!threadsMap[queryKey][currentPage].isLoaded) {
        threadsMap[queryKey][currentPage].threads = await fetchThreads(
          JSON.parse(queryKey),
          pageSize,
          currentPage * pageSize,
        );
        threadsMap[queryKey][currentPage].isLoaded = true;
      }

      threadsMap[queryKey][currentPage].threads = threadsMap[queryKey][
        currentPage
      ].threads.map((initialThread) => {
        if (initialThread.id === thread.id) {
          initialThread = Object.assign(initialThread, thread);
        }
        return initialThread;
      });
      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey][currentPage].threads;
    },
    updateThreadSelection: (
      queryKey: string,
      currentPage: number,
      threadId?: string,
    ) => {
      const threads = threadsMap[queryKey][currentPage].threads;

      if (!threadId) {
        const selectionState = threads.some((thread) => thread.selected);
        for (const thread of threads) {
          thread.selected = !selectionState;
        }
      } else {
        const thread = threads.find((thread) => thread.id === threadId);
        if (thread) {
          thread.selected = !thread.selected;
        }
      }
      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey][currentPage].threads;
    },

    reset: () => {
      threadsMap = {};
      set({});
    },

    hydrateMessageInThread: (
      incomingMessage: Message,
      query: MailboxQuery,
      currentPage: number,
    ) => {
      const queryKey = JSON.stringify(query);

      const foundThread = threadsMap[queryKey][currentPage]?.threads.find(
        (thread) => thread.id === incomingMessage.thread_id,
      );
      if (foundThread) {
        const foundMessage = foundThread.messages?.find(
          (message) => message.id === incomingMessage.id,
        );
        if (foundMessage) {
          foundMessage.body = incomingMessage.body;
          update((threads) => {
            if (incomingMessage.thread_id) {
              let threadToUpdate = threads[queryKey][currentPage].threads.find(
                (thread) => thread.id === foundThread.id,
              );

              if (threadToUpdate) {
                threadToUpdate = JSON.parse(JSON.stringify(foundThread));
              }
            }
            return { ...threads };
          });
        }
      }
      return threadsMap[queryKey][currentPage].threads;
    },
  };
}

export const MailboxStore = initializeThreads();

export const EmailStore: Readable<Record<string, Thread[]>> = derived(
  MailboxStore,
  ($MailboxStore) => {
    const emailStore: Record<string, Thread[]> = {};
    Object.entries($MailboxStore).forEach(
      ([key, paginatedThreads]) =>
        (emailStore[key] = paginatedThreads
          .map((paginatedThread) => paginatedThread.threads)
          .flat()),
    );
    return emailStore;
  },
);
