import { MessageStore } from "../store/messages";
import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const sendMessage = async (
  component_id: string,
  msg: Composer.Message,
  access_token?: string,
): Promise<Nylas.Message> => {
  return await fetch(
    `${getMiddlewareApiUrl(component_id)}/send`,
    getFetchConfig({ method: "POST", component_id, access_token, body: msg }),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Message>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(component_id, error));
};

export const uploadFile = async (
  component_id: string,
  file: File,
  access_token?: string,
): Promise<Nylas.File> => {
  const fetchConfig: RequestInit = getFetchConfig({
    method: "POST",
    component_id,
    access_token,
  });
  const form = new FormData();
  form.append("file", file);
  if (
    typeof fetchConfig.headers !== "undefined" &&
    "Content-Type" in fetchConfig.headers
  ) {
    delete fetchConfig.headers["Content-Type"];
  }
  fetchConfig.body = form;
  return await fetch(`${getMiddlewareApiUrl(component_id)}/files`, fetchConfig)
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.File>>(response),
    )
    .then((json) => {
      return Array.isArray(json.response) ? json.response[0] : json.response;
    })
    .catch(handleError.bind(0, component_id));
};

export const fetchMessages = async (
  query: Nylas.MessagesQuery,
  offset: number,
  limit: number,
): Promise<Nylas.Message[]> => {
  let queryString = `${getMiddlewareApiUrl(
    query.component_id,
  )}/messages?offset=${offset}&limit=${limit}`;
  if (query.received_before) {
    queryString = `${queryString}&received_before=${query.received_before}`;
  }
  if (query.received_after) {
    queryString = `${queryString}&received_after=${query.received_after}`;
  }
  return await fetch(queryString, getFetchConfig(query))
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Message[]>>(response),
    )
    .then((json) => {
      MessageStore.addMessages({
        queryKey: JSON.stringify(query),
        data: json.response,
      });
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const fetchMessage = async (
  query: Nylas.CommonQuery,
  messageID: string,
): Promise<Nylas.Message> => {
  const queryString = `${getMiddlewareApiUrl(
    query.component_id,
  )}/messages/${messageID}`;
  return await fetch(queryString, getFetchConfig(query))
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Message>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

// For cases when someone wants to show just a single email message, rather than the full thread and w/o passing a thread id
export const fetchEmail = async (
  query: Nylas.SingularEmail,
): Promise<Nylas.Message> => {
  const queryString = `${getMiddlewareApiUrl(query.component_id)}/messages/${
    query.message_id
  }`;
  return await fetch(queryString, getFetchConfig(query))
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Message>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
