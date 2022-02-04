import { MessageStore } from "../store/messages";
import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  SingularEmail,
  CommonQuery,
  MessagesQuery,
  File as NylasFile,
  Message as NylasMessage,
  MiddlewareResponse,
} from "@commons/types/Nylas";
import type { Message } from "@commons/types/Composer";

export const sendMessage = async (
  component_id: string,
  msg: Message,
  access_token?: string,
): Promise<NylasMessage> => {
  return await fetch(
    `${getMiddlewareApiUrl(component_id)}/send`,
    getFetchConfig({ method: "POST", component_id, access_token, body: msg }),
  )
    .then((response) =>
      handleResponse<MiddlewareResponse<NylasMessage>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(component_id, error));
};

export async function updateMessage(
  component_id: string,
  message: NylasMessage,
  access_token?: string,
): Promise<NylasMessage> {
  const url = `${getMiddlewareApiUrl(component_id)}/messages/${message.id}`;
  const fetchConfig = getFetchConfig({
    method: "PUT",
    component_id,
    access_token,
    body: { folder_id: message.folder_id },
  });
  return await fetch(url, fetchConfig)
    .then((response) =>
      handleResponse<MiddlewareResponse<NylasMessage>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(component_id, error));
}

export const uploadFile = async (
  component_id: string,
  file: File,
  access_token?: string,
): Promise<NylasFile> => {
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
    .then((response) => handleResponse<MiddlewareResponse<NylasFile>>(response))
    .then((json) => {
      return Array.isArray(json.response) ? json.response[0] : json.response;
    })
    .catch(handleError.bind(0, component_id));
};

export const fetchMessages = async (
  query: MessagesQuery,
  offset: number,
  limit: number,
): Promise<NylasMessage[]> => {
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
      handleResponse<MiddlewareResponse<NylasMessage[]>>(response),
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
  query: CommonQuery,
  messageID: string,
): Promise<NylasMessage> => {
  const queryString = `${getMiddlewareApiUrl(
    query.component_id,
  )}/messages/${messageID}`;
  return await fetch(queryString, getFetchConfig(query))
    .then((response) =>
      handleResponse<MiddlewareResponse<NylasMessage>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

// For cases when someone wants to show just a single email message, rather than the full thread and w/o passing a thread id
export const fetchEmail = async (
  query: SingularEmail,
): Promise<NylasMessage> => {
  const queryString = `${getMiddlewareApiUrl(query.component_id)}/messages/${
    query.message_id
  }`;
  return await fetch(queryString, getFetchConfig(query))
    .then((response) =>
      handleResponse<MiddlewareResponse<NylasMessage>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
