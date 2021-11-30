import { writable } from "svelte/store";
import { fetchContactImage } from "@commons/connections/contacts";
import type { ContactsQuery } from "@commons/types/Contacts";

const contactAvatarMap: Record<string, string> = {};

function initializeContactAvatars() {
  const { subscribe, set } = writable<Record<string, string>>({});
  return {
    subscribe,
    getContactAvatar: async (
      query: ContactsQuery,
      contact_id: string,
      refresh = false,
    ) => {
      if (!contactAvatarMap[contact_id] || refresh) {
        const avatar = await fetchContactImage(query, contact_id)
          .then((res) => res)
          .catch(() => "");
        if (avatar) {
          contactAvatarMap[contact_id] = avatar;
        }
      }
      return contactAvatarMap[contact_id];
    },
    reset: () => set({}),
  };
}

export const ContactAvatarStore = initializeContactAvatars();
