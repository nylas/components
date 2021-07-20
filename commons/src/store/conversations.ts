import { writable } from "svelte/store";

function initializeConversations() {
  const { subscribe, set, update } = writable<
    Record<string, Nylas.Conversation>
  >({});
  return {
    subscribe,
    addThread: (incomingThread: Nylas.StoredConversation) => {
      update((thread) => {
        thread[incomingThread.queryKey] = incomingThread.data;
        return { ...thread };
      });
    },
    updateThread: (incomingThread: Nylas.StoredConversation) => {
      update((thread) => {
        thread[incomingThread.queryKey] = {
          ...thread[incomingThread.queryKey],
          ...incomingThread.data,
        };
        return { ...thread };
      });
    },
    addMessageToThread: (incomingMessage: Nylas.StoredMessage) => {
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
