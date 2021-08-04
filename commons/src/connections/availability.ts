import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";
import type {
  AvailabilityQuery,
  AvailabilityResponse,
} from "@commons/types/Availability";
import type { MiddlewareResponse } from "@commons/types/Nylas";

export const fetchAvailability = async (
  query: AvailabilityQuery,
): Promise<AvailabilityResponse[]> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/calendars/free-busy`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      body: query.body,
    }),
  )
    .then(async (apiResponse) => {
      const json = await handleResponse<
        MiddlewareResponse<AvailabilityResponse[]>
      >(apiResponse);
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
