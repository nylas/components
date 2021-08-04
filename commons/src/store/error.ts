import { Writable, writable } from "svelte/store";
import type { Manifest } from "@commons/types/Nylas";

type ErrorStore = Record<string, Manifest["error"]>;

function initialize(): Writable<ErrorStore> {
  return writable({});
}

export const ErrorStore = initialize();
