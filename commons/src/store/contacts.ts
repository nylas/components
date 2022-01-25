import { writable } from "svelte/store";
import {
  fetchContacts,
  fetchContactsByQuery,
} from "@commons/connections/contacts";
import type {
  Contact,
  ContactEmail,
  ContactSearchQuery,
  ContactsQuery,
  ContactsQueryParams,
} from "@commons/types/Contacts";

let contactsMap: Record<string, Contact[]> = {};

function filterContacts(contacts: Contact[]) {
  return contacts
    .filter(
      (contact) =>
        !!contact.given_name ||
        !!contact.surname ||
        (Array.isArray(contact.emails) && contact.emails.length > 0),
    )
    .map((contact) => {
      // Ensure each contact has at least one "email" to load
      if (!Array.isArray(contact.emails) || contact.emails.length === 0) {
        contact.emails = [{ email: "" } as ContactEmail];
      }

      return contact;
    });
}

function initializeContacts() {
  const { subscribe, set, update } = writable<Record<string, Contact[]>>({});
  return {
    subscribe,
    addContacts: async (query: ContactsQuery, params: ContactsQueryParams) => {
      const queryKey = JSON.stringify(query);
      if (
        !contactsMap[queryKey] &&
        (query.component_id || query.access_token)
      ) {
        if (params.offset === 0) {
          // Ensure the store is empty if our offset is 0
          ContactStore.reset();
        }

        const contacts =
          (await fetchContacts(query, params)
            .then((contacts) => filterContacts(contacts))
            .catch(() => [])) ?? [];

        contactsMap[queryKey] = contactsMap[queryKey]
          ? [...contactsMap[queryKey], ...contacts]
          : contacts;

        update((contacts) => {
          contacts[queryKey] = contactsMap[queryKey];
          return { ...contacts };
        });
        return contactsMap[queryKey];
      }
    },
    addContact: async (query: ContactSearchQuery) => {
      const queryKey = JSON.stringify(query);
      if (
        !contactsMap[queryKey] &&
        (query.component_id || query.access_token)
      ) {
        const contacts =
          (await fetchContactsByQuery(query)
            .then((contacts) => filterContacts(contacts))
            .catch(() => [])) ?? [];

        contactsMap[queryKey] = contactsMap[queryKey]
          ? [...contactsMap[queryKey], ...contacts]
          : contacts;
        update((contacts) => {
          contacts[queryKey] = contactsMap[queryKey];
          return { ...contacts };
        });
      }
      return contactsMap[queryKey];
    },
    reset: () => {
      contactsMap = {};
      set({});
    },
  };
}

export const ContactStore = initializeContacts();
