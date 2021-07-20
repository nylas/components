declare namespace Flux {
  interface Subscription {
    type?: Event["type"];
    notify(event: Event, state: Store): void;
  }

  interface Reducer {
    (state: Flux.Store, event: Flux.Event): Flux.Store;
  }
  interface Dispatch {
    (event: Flux.Event): void;
  }

  interface Store {
    events: Record<string, Events.Event[]>;
    fetchEventsStarted?: boolean;
    errors: Record<string, Error>;
    contacts: Contacts.Contact[];
    fetchContactsStarted?: boolean;
  }

  interface Event<T = unknown> {
    type: string;
    payload: T;
  }

  interface Notifier {
    subscribe: (...subscriptions: Subscription[]) => () => void;
    unsubscribe: (subscriber: Subscription) => void;
    notifyAll: (event: Event, state: Store) => void;
    connect: (component: {
      $$: {
        on_destroy: Notifier["unsubscribe"][];
      };
      $set(props: { store: Store }): void;
    }) => Store;
  }
}
