import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  CleanConversationQuery,
  Message,
  CleanConversationFeedbackQuery,
  MiddlewareResponse,
} from "@commons/types/Nylas";

export const fetchCleanConversations = (
  query: CleanConversationQuery,
): Promise<Message[]> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/neural/conversation`,
    getFetchConfig({
      method: "PUT",
      component_id: query.component_id,
      body: { message_id: query.message_id },
    }),
  )
    .then(async (apiResponse) => {
      const json = await handleResponse<MiddlewareResponse<Message[]>>(
        apiResponse,
      );
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const sendCleanConversationFeedback = (
  query: CleanConversationFeedbackQuery,
): Promise<Message> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/neural/conversation/feedback`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      body: { message_id: query.message_id },
    }),
  )
    .then((response) => handleResponse<MiddlewareResponse<Message>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
