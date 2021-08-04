import type { Participant } from "@commons/types/Nylas";

export interface FetchContactsCallback {
  (term: string | void): Promise<any>;
}

export interface ChangeCallback {
  (data: Participant[]): Promise<void>;
}

export interface BlurOptions {
  blurIn?: number | Event;
  addContact?: boolean;
}
export type CallbackDebounceFunction = (...args: any) => void;
