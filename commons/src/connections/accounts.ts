import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  AccountQuery,
  Account,
  MiddlewareResponse,
} from "@commons/types/Nylas";

export const fetchAccount = async (query: AccountQuery): Promise<Account> => {
  const account = await fetch(
    `${getMiddlewareApiUrl(query.component_id)}/account`,
    getFetchConfig(query),
  )
    .then((response) => handleResponse<MiddlewareResponse<Account>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));

  return account;
};
