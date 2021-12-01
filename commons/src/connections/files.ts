import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type { FileQuery, MiddlewareResponse } from "@commons/types/Nylas";

export const downloadFile = async (query: FileQuery): Promise<string> => {
  let queryString = `${getMiddlewareApiUrl(query.component_id)}/files/${
    query.file_id
  }/download`;

  return await fetch(queryString, getFetchConfig(query))
    .then((response) => handleResponse<MiddlewareResponse<string>>(response))
    .then((json) => json.response)
    .catch((error) => handleError(query.component_id, error));
};
