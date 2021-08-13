import { writable } from "svelte/store";
import { fetchContactsByQuery } from "@commons";
import type {
  StoredContacts,
  Contact,
  ContactSearchQuery,
} from "@commons/types/Contacts";

const contactsMap: Record<string, Contact[]> = {};

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
    addContact: async (query: ContactSearchQuery) => {
      const queryKey = JSON.stringify(query);
      if (
        !contactsMap[queryKey] &&
        (query.component_id || query.access_token)
      ) {
        contactsMap[queryKey] = await fetchContactsByQuery(query)
          .then((res) => {
            if (res.length) {
              return res;
            } else {
              return [];
            }
          })
          .catch(() => []);
      }
      update((contacts) => {
        contacts[queryKey] = contactsMap[queryKey];
        return { ...contacts };
      });
      return contactsMap[queryKey];
    },
    reset: () => set({}),
  };
}

export const ContactStore = initializeContacts();
