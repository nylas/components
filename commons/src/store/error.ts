import { Writable, writable } from "svelte/store";

type ErrorStore = Record<string, Nylas.Manifest["error"]>;

function initialize(): Writable<ErrorStore> {
  return writable({});
}

export const ErrorStore = initialize();
