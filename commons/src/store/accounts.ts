import { writable } from "svelte/store";
import { fetchAccount } from "../connections/accounts";

function initializeAccounts() {
  const { subscribe, set, update } = writable<Record<string, Nylas.Account>>(
    {},
  );
  let AccountsMap: Record<string, Nylas.Account> = {};

  return {
    subscribe,
    getAccount: async (query: Nylas.AccountQuery) => {
      const queryKey = JSON.stringify(query);
      if (
        !AccountsMap[queryKey] &&
        (query.component_id || query.access_token)
      ) {
        AccountsMap[queryKey] = await fetchAccount(query);
        update((accounts) => {
          accounts[queryKey] = AccountsMap[queryKey];
          return { ...accounts };
        });
      }
      return AccountsMap[queryKey];
    },
    reset: () => {
      AccountsMap = {};
      set({});
    },
  };
}

export const AccountStore = initializeAccounts();
