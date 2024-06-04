import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
  getDashboardApiUrl,
} from "../methods/api";
import type { FileQuery, MiddlewareResponse } from "@commons/types/Nylas";

export const downloadFile = async (query: FileQuery): Promise<string> => {
  const queryString = `${getMiddlewareApiUrl(query.component_id)}/files/${
    query.file_id
  }/download`;

  return await fetch(queryString, getFetchConfig(query))
    .then((response) => handleResponse<MiddlewareResponse<string>>(response))
    .then((json) => json.response)
    .catch((error) => handleError(query.component_id, error));
};

export const streamDownloadFile = async ({
  file_id,
  component_id,
  access_token,
}: {
  [key: string]: string;
}): Promise<Blob> => {
  const baseUrl = getDashboardApiUrl(component_id);
  const url = `${baseUrl}/components/files/${file_id}/download`;

  const response = await fetch(url, {
    // replace with your actual download endpoint
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Component-Id": component_id || "", // Component ID is passed as header
      "X-Access-Token": access_token || "", // Access Token is passed as header
      Authorization: `Bearer ${access_token || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const blob = await response.blob();

  return blob;
};
