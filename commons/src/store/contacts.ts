import { writable } from "svelte/store";

function initializeContacts() {
  const { subscribe, set, update } = writable<
    Record<string, Contacts.Contact[]>
  >({});
  return {
    subscribe,
    addContacts: (incomingContacts: Contacts.StoredContacts) => {
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
