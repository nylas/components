import { writable } from "svelte/store";
import type { StoredContacts, Contact } from "@commons/types/Contacts";

function initializeContacts() {
  const { subscribe, set, update } = writable<Record<string, Contact[]>>({});
  return {
    subscribe,
    addContacts: (incomingContacts: StoredContacts) => {
      update((contacts) => {
        contacts[incomingContacts.queryKey] = contacts[
          incomingContacts.queryKey
        ]
          ? [...contacts[incomingContacts.queryKey], ...incomingContacts.data]
          : incomingContacts.data;
        return contacts;
      });
    },
    reset: () => set({}),
  };
}

export const ContactStore = initializeContacts();
