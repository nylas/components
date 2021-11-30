import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  CommonQuery,
  MiddlewareResponse,
  Label,
} from "@commons/types/Nylas";

export const fetchLabels = async (query: CommonQuery): Promise<Label[]> => {
  const queryString = `${getMiddlewareApiUrl(query.component_id)}/labels`;
  return await fetch(queryString, getFetchConfig(query))
    .then((response) => handleResponse<MiddlewareResponse<Label[]>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
