import { ContactStore } from "../store/contacts";
import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const fetchContacts = async (
  query: Contacts.ContactsQuery,
  offset: number,
  limit: number,
): Promise<Contacts.Contact[]> => {
  const contacts = await fetch(
    `${getMiddlewareApiUrl(
      query.component_id,
    )}/contact-list/contacts?limit=${limit}&offset=${offset}`,
    getFetchConfig({
      component_id: query.component_id,
      access_token: query.access_token,
    }),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Contacts.Contact[]>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));

  if (offset === 0) {
    // Ensure the store is empty if our offset is 0
    ContactStore.reset();
  }

  ContactStore.addContacts({
    queryKey: JSON.stringify(query),
    data: contacts
      // Filter out any contacts without a name or email
      .filter(
        (contact) =>
          !!contact.given_name ||
          !!contact.surname ||
          (Array.isArray(contact.emails) && contact.emails.length > 0),
      )
      .map((contact) => {
        // Ensure each contact has at least one "email" to load
        if (!Array.isArray(contact.emails) || contact.emails.length === 0) {
          contact.emails = [{ email: "" } as Contacts.ContactEmail];
        }

        return contact;
      }),
  });

  return contacts;
};

// query.query should be a queryString as defined at https://docs.nylas.com/reference#contacts-1
export const fetchContactsByQuery = async (
  query: Contacts.ContactSearchQuery,
): Promise<Contacts.Contact[]> => {
  const contacts = await fetch(
    `${getMiddlewareApiUrl(query.component_id)}/contacts${query.query}`,
    getFetchConfig({
      component_id: query.component_id,
      access_token: query.access_token,
    }),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Contacts.Contact[]>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));

  ContactStore.addContacts({
    queryKey: JSON.stringify(query),
    data: contacts
      // Filter out any contacts without a name or email
      .filter(
        (contact) =>
          !!contact.given_name ||
          !!contact.surname ||
          (Array.isArray(contact.emails) && contact.emails.length > 0),
      )
      .map((contact) => {
        // Ensure each contact has at least one "email" to load
        if (!Array.isArray(contact.emails) || contact.emails.length === 0) {
          contact.emails = [{ email: "" } as Contacts.ContactEmail];
        }
        return contact;
      }),
  });

  return contacts;
};

export const fetchContactImage = async (
  query: Contacts.ContactsQuery,
  id: string,
): Promise<string> => {
  return await fetch(
    `${getMiddlewareApiUrl(query.component_id)}/contacts/${id}/picture`,
    getFetchConfig({
      component_id: query.component_id,
      access_token: query.access_token,
    }),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<string>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const fetchContactThreads = async (
  query: Contacts.ContactsQuery,
  offset: number,
  limit: number,
): Promise<Nylas.Thread[]> => {
  return await fetch(
    `${getMiddlewareApiUrl(
      query.component_id,
    )}/threads?offset=${offset}&limit=${limit}`,
    getFetchConfig(query),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Thread[]>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
