import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const fetchAccount = async (
  query: Nylas.AccountQuery,
): Promise<Nylas.Account> => {
  const account = await fetch(
    `${getMiddlewareApiUrl(query.component_id)}/account`,
    getFetchConfig(query),
  )
    .then((response) =>
      handleResponse<Nylas.MiddlewareResponse<Nylas.Account>>(response),
    )
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));

  return account;
};
