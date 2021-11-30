import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  CommonQuery,
  MiddlewareResponse,
  Folder,
} from "@commons/types/Nylas";

export const fetchFolders = async (query: CommonQuery): Promise<Folder[]> => {
  const queryString = `${getMiddlewareApiUrl(query.component_id)}/folders`;
  return await fetch(queryString, getFetchConfig(query))
    .then((response) => handleResponse<MiddlewareResponse<Folder[]>>(response))
    .then((json) => {
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
