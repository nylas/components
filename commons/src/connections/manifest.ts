import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const fetchManifest = async (
  id: string,
  access_token?: string,
): Promise<Nylas.Manifest> => {
  return await fetch(
    `${getMiddlewareApiUrl(id)}/manifest`,
    getFetchConfig({
      access_token,
      component_id: id,
    }),
  )
    .then<Nylas.MiddlewareResponse>(handleResponse)
    .then((response) => response.component.theming)
    .catch((error) => handleError(id, error));
};
