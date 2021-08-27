import { derived, writable } from "svelte/store";
import {
  fetchThread,
  fetchThreads,
  fetchThreadsWithSearchKeyword,
  updateThread,
} from "../connections/threads";
import type {
  Thread,
  MailboxQuery,
  ConversationQuery,
  Message,
  Conversation,
  ThreadsWithSearchKeywordQuery,
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
        threadsMap[queryKey] = await fetchThreads(query);
      }
      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey];
    },
    getThreadsWithSearchKeyword: async (
      query: ThreadsWithSearchKeywordQuery,
    ) => {
      const queryKey = JSON.stringify(query);
      if (!threadsMap[queryKey] && (query.component_id || query.access_token)) {
        threadsMap[queryKey] = (await fetchThreadsWithSearchKeyword(query)).map(
          (thread) => thread,
        );
      }
      update((threads) => {
        threads[queryKey] = threadsMap[queryKey];
        return { ...threads };
      });
      return threadsMap[queryKey];
    },
    updateThread: async (
      threadQuery: ConversationQuery,
      queryKey: string,
      updatedThread: Conversation,
    ) => {
      const thread = await updateThread(threadQuery, updatedThread);
      if (!threadsMap[queryKey]) {
        threadsMap[queryKey] = await fetchThreads(JSON.parse(queryKey));
      }
      threadsMap[queryKey] = threadsMap[queryKey].map((initialThread) => {
        if (initialThread.id === thread.id) {
          initialThread = Object.assign(initialThread, thread);
        }
        return initialThread;
      });
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
