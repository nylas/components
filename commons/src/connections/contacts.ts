import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
  buildQueryParams,
} from "../methods/api";
import type {
  ContactsQuery,
  Contact,
  ContactSearchQuery,
  ContactsQueryParams,
} from "@commons/types/Contacts";
import type { MiddlewareResponse, Thread } from "@commons/types/Nylas";

export const fetchContacts = async (
  query: ContactsQuery,
  params: ContactsQueryParams,
): Promise<Contact[]> => {
  const url = `${getMiddlewareApiUrl(
    query.component_id,
  )}/contact-list/contacts?${buildQueryParams(params)}`;

  const contacts = await fetch(
    url,
    getFetchConfig({
      component_id: query.component_id,
      access_token: query.access_token,
    }),
  )
    .then((response) => handleResponse<MiddlewareResponse<Contact[]>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
  return contacts ?? [];
};

// query.query should be a queryString as defined at https://docs.nylas.com/reference#contacts-1
export const fetchContactsByQuery = async (
  query: ContactSearchQuery,
): Promise<Contact[]> => {
  const contacts = await fetch(
    `${getMiddlewareApiUrl(query.component_id)}/contacts${query.query}`,
    getFetchConfig({
      component_id: query.component_id,
      access_token: query.access_token,
    }),
  )
    .then((response) => handleResponse<MiddlewareResponse<Contact[]>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));

  return contacts ?? [];
};

export const fetchContactImage = async (
  query: ContactsQuery,
  id: string,
): Promise<string> => {
  return await fetch(
    `${getMiddlewareApiUrl(query.component_id)}/contacts/${id}/picture`,
    getFetchConfig({
      component_id: query.component_id,
      access_token: query.access_token,
    }),
  )
    .then((response) => handleResponse<MiddlewareResponse<string>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const fetchContactThreads = async (
  query: ContactsQuery,
  offset: number,
  limit: number,
): Promise<Thread[]> => {
  return await fetch(
    `${getMiddlewareApiUrl(
      query.component_id,
    )}/threads?offset=${offset}&limit=${limit}`,
    getFetchConfig(query),
  )
    .then((response) => handleResponse<MiddlewareResponse<Thread[]>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
