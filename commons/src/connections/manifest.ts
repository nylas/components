import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type { Manifest, MiddlewareResponse } from "@commons/types/Nylas";

export const fetchManifest = async (
  id: string,
  access_token?: string,
): Promise<Manifest> => {
  return await fetch(
    `${getMiddlewareApiUrl(id)}/manifest`,
    getFetchConfig({
      access_token,
      component_id: id,
    }),
  )
    .then<MiddlewareResponse>(handleResponse)
    .then((response) => response.component.theming)
    .catch((error) => handleError(id, error));
};

// Allows <nylas-schedule-editor> to modify its own properties

interface saveManifestParams {
  id: string;
  access_token?: string;
  manifest: Manifest;
}

export const saveManifest = async (
  params: saveManifestParams
): Promise<Manifest> => {
  const { id, access_token, manifest } = params;
  return fetch(
    `${getMiddlewareApiUrl(id)}/component`,
    getFetchConfig({
      method: "PUT",
      component_id: id,
      access_token,
      body: manifest,
    }),
  )
    .then((response) => handleResponse<MiddlewareResponse<Manifest>>(response))
    .then((json) => {
      return json.response;
    });
}
