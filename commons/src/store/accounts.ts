import { writable } from "svelte/store";
import { fetchAccount } from "../connections/accounts";
import type { Account, AccountQuery } from "@commons/types/Nylas";

function initializeAccounts() {
  const { subscribe, set, update } = writable<Record<string, Account>>({});
  let AccountsMap: Record<string, Account> = {};

  return {
    subscribe,
    getAccount: async (query: AccountQuery) => {
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
