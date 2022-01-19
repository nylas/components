import { ErrorStore } from "../store/error";
import type { Manifest } from "@commons/types/Nylas";

export async function handleResponse<T = unknown>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    const passedError = await response.json().then(
      (json: {
        message: string;
        name: string;
        response?: {
          error?: string;
        };
      }) => json,
    );

    const message = passedError?.response?.error || passedError?.message;

    const error = new Error(message);
    error.name = passedError.name;
    return Promise.reject({ message: error, statusCode: response.status });
  }
  return response.json();
}

type HTTPMethod = "POST" | "GET" | "PUT" | "PATCH" | "OPTIONS" | undefined;

type FetchOptions = {
  body?: unknown;
  method?: HTTPMethod;
  component_id?: string;
  access_token?: string;
};

export function getFetchConfig(
  opts: FetchOptions = { component_id: "" },
): RequestInit {
  return {
    method: opts.method || "GET", // GET is default method
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Component-Id": opts.component_id || "", // Component ID is passed as header
      "X-Access-Token": opts.access_token || "", // Access Token is passed as header
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  };
}

export function handleError(id: string, error: Manifest["error"]): never {
  if (process.env.NODE_ENV !== "production") console.error(error);
  ErrorStore.update((errorMap) => ({ ...errorMap, [id]: error }));
  throw error;
}

const REGION_MAPPING: Record<string, string> = {
  "001": "", // US
  "002": "ireland-", // EU
  "003": "canada-", // Canada
};

export function getMiddlewareApiUrl(id: string): string {
  let region = "";
  if (id.substring(3, 4) === "-") {
    const code = id.substring(0, 3);
    if (typeof REGION_MAPPING[code] !== "undefined") {
      region = REGION_MAPPING[code];
    }
  }
  const API_GATEWAY = `https://${region}${process.env.API_GATEWAY}`;
  return API_GATEWAY;
}

export function silence(error: Error) {}
