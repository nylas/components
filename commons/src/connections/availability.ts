import {
  getFetchConfig,
  handleError,
  handleResponse,
  getMiddlewareApiUrl,
} from "../methods/api";

export const fetchAvailability = (
  query: Availability.AvailabilityQuery,
): Promise<Availability.AvailabilityResponse> => {
  return fetch(
    `${getMiddlewareApiUrl(query.component_id)}/calendars/availability`,
    getFetchConfig({
      method: "POST",
      component_id: query.component_id,
      body: query.body,
    }),
  )
    .then(async (apiResponse) => {
      const json = await handleResponse<
        Nylas.MiddlewareResponse<Availability.AvailabilityResponse>
      >(apiResponse);
      return json.response;
    })
    .catch((error) => handleError(query.component_id, error));
};
