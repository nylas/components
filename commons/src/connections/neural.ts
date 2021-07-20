import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const fetchCleanConversations = (
  query: Nylas.CleanConversationQuery,
): Promise<Nylas.Message[]> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/neural/conversation`,
    getFetchConfig({
      method: "PUT",
      component_id: query.component_id,
      body: { message_id: query.message_id },
    }),
  )
    .then(async (apiResponse) => {
      const json = await handleResponse<
        Nylas.MiddlewareResponse<Nylas.Message[]>
      >(apiResponse);
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};

export const sendCleanConversationFeedback = (
  query: Nylas.CleanConversationFeedbackQuery,
): Promise<Nylas.Message> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/neural/conversation/feedback`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      body: { message_id: query.message_id },
    }),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Message>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
