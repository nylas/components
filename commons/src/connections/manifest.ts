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
