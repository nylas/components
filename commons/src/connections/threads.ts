import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  MailboxQuery,
  Thread,
  ConversationQuery,
  Conversation,
  MiddlewareResponse,
} from "@commons/types/Nylas";

export const fetchThreads = (
  query: MailboxQuery,
  limit: number,
  offset: number,
): Promise<Thread[]> => {
  if (query.thread_ids) {
    // &limit=${limit}&offset=${offset}
    const page_of_ids = query.thread_ids.slice(offset, offset + limit);
    return Promise.all(
      page_of_ids.map(async (thread_id) => {
        // Nylas API does not support fetching threads in bulk, so must fetch them one
        // at a time :(
        const queryString = `${getMiddlewareApiUrl(
          query.component_id,
        )}/threads/${thread_id}?view=expanded`;
        // TODO: ideally this wouldn't replicate much of the code from below
        return await fetch(queryString, getFetchConfig(query))
          .then((response) =>
            handleResponse<MiddlewareResponse<Thread>>(response),
          )
          .then((json) => json.response)
          // TODO: Remove this ugly hack when we fix the API from returning ghost messages (e.g. w/o a from/to field)
          .then((thread) => ({
            ...thread,
            messages: thread.messages.filter(
              (message) => message.from.length !== 0 || message.to.length !== 0,
            ),
          }))
          .catch((error) => handleError(query.component_id, error));
      }),
    );
  }
  let queryString = `${getMiddlewareApiUrl(
    query.component_id,
  )}/threads?view=expanded&not_in=trash&limit=${limit}&offset=${offset}`;
  if (query.query) {
    Object.entries(query.query).forEach(
      (param) => (queryString = queryString.concat(`&${param[0]}=${param[1]}`)),
    );
  }
  return (
    fetch(queryString, getFetchConfig(query))
      .then((response) =>
        handleResponse<MiddlewareResponse<Thread[]>>(response),
      )
      .then((json) => json.response)
      // TODO: Remove this ugly hack when we fix the API from returning ghost messages (e.g. w/o a from/to field)
      .then((threads) =>
        threads.map((thread) => ({
          ...thread,
          messages: thread.messages.filter(
            (message) => message.from.length !== 0 || message.to.length !== 0,
          ),
        })),
      )
      .catch((error) => handleError(query.component_id, error))
  );
};

export function fetchThreadCount(query: MailboxQuery): Promise<number> {
  let queryString = `${getMiddlewareApiUrl(
    query.component_id,
  )}/threads?view=expanded&not_in=trash&view=count`;
  if (query.query) {
    Object.entries(query.query).forEach(
      (param) => (queryString = queryString.concat(`&${param[0]}=${param[1]}`)),
    );
  }

  if (query.keywordToSearch) {
    queryString += `&q=${query.keywordToSearch}`;
  }

  return fetch(queryString, getFetchConfig(query))
    .then((response) => handleResponse<MiddlewareResponse<any>>(response))
    .then((json) => json.response.count);
}

export const fetchSearchResultThreads = (
  query: MailboxQuery,
): Promise<Thread[]> => {
  const queryString = `${getMiddlewareApiUrl(
    query.component_id,
  )}/threads/search?q=${query.keywordToSearch}&view=expanded&limit=${
    query.query.limit
  }&offset=${query.query.offset}`;

  return fetch(queryString, getFetchConfig(query))
    .then(async (response) =>
      handleResponse<MiddlewareResponse<Thread[]>>(response),
    )
    .then((json) => json.response)
    .catch((error) => handleError(query.component_id, error));
};

export const fetchThread = async (
  query: ConversationQuery,
): Promise<Conversation> => {
  const thread = await fetch(
    `${getMiddlewareApiUrl(query.component_id)}/threads/${
      query.thread_id
    }?view=expanded`,
    getFetchConfig({
      component_id: query.component_id,
      access_token: query.access_token,
    }),
  )
    .then((response) =>
      handleResponse<MiddlewareResponse<Conversation>>(response),
    )
    .then((json) => json.response)
    .catch((error) => handleError(query.component_id, error));

  return thread;
};

export const updateThread = (
  query: ConversationQuery,
  updatedThread: Conversation,
): Promise<Conversation> => {
  // accepts unread, starred, folder_id + label_ids. developer.nylas.com/docs/api/#put/threads/id
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/threads/${updatedThread.id}`,
    getFetchConfig({
      method: "PUT",
      component_id: query.component_id,
      access_token: query.access_token,
      body: {
        unread: updatedThread.unread,
        starred: updatedThread.starred,
        folder_id: updatedThread.folder_id,
        label_ids: updatedThread.label_ids,
      },
    }),
  )
    .then((response) =>
      handleResponse<MiddlewareResponse<Conversation>>(response),
    )
    .then((json) => json.response)
    .catch((error) => handleError(query.component_id, error));
};
