declare namespace ContactsSearch {
  interface FetchContactsCallback {
    (term: string | void): Promise<any>;
  }

  interface ChangeCallback {
    (data: Nylas.Participant[]): Promise<void>;
  }

  interface BlurOptions {
    blurIn?: number | Event;
    addContact?: boolean;
  }
  type CallbackDebounceFunction = (...args: any) => void;
}
