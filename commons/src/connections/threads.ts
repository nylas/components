import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const fetchThreads = async (
  query: Nylas.MailboxQuery,
): Promise<Nylas.Thread[]> => {
  let queryString = `${getMiddlewareApiUrl(
    query.component_id,
  )}/threads?view=expanded`;
  if (query.query) {
    Object.entries(query.query).forEach(
      (param) => (queryString = queryString.concat(`&${param[0]}=${param[1]}`)),
    );
  }
  return await fetch(queryString, getFetchConfig(query))
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Thread[]>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const fetchThread = async (
  query: Nylas.ConversationQuery,
): Promise<Nylas.Conversation> => {
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
      handleResponse<Nylas.MiddlewareResponse<Nylas.Conversation>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));

  return thread;
};

export const updateThread = async (
  query: Nylas.ConversationQuery,
  updatedThread: Nylas.Conversation,
): Promise<Nylas.Conversation> => {
  // accepts unread, starred, folder_id + label_ids. developer.nylas.com/docs/api/#put/threads/id
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/threads/${updatedThread.id}`,
    getFetchConfig({
      method: "PUT",
      component_id: query.component_id,
      body: {
        unread: updatedThread.unread,
        starred: updatedThread.starred,
      },
    }),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Conversation>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
