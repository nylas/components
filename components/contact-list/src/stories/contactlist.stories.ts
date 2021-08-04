import type { SvelteComponent } from "svelte";
import ContactList from "../ContactList.svelte";
import type { HydratedContact } from "@commons/types/Contacts";

export default {
  title: "Contactlist",
  component: ContactList,
  argTypes: {
    click_action: {
      control: {
        type: "inline-radio",
        options: ["email", "select"],
      },
    },
    sort_by: {
      control: {
        type: "inline-radio",
        options: ["name", "last_emailed"],
      },
    },
    theme: {
      control: {
        type: "inline-radio",
        options: ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"],
        default: "theme-1",
      },
    },
  },
};

const componentID = "81137b54-bd3e-4c46-b3a5-6aa189ba6095"; // web@components.com user

interface ContactListProps {
  Component: typeof SvelteComponent;
  props: {
    id?: string;
    contacts?: HydratedContact[] | null;
    theme?: string;
    click_action?: "email" | "select";
    sort_by?: "last_emailed" | "name";
    threads_to_load?: number;
    contacts_to_load?: number;
    default_photo?: string;
  };
}

interface ContactListArgs {
  click_action: "email" | "select";
  sort_by: "name" | "last_emailed";
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
}

export const StaticData = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    contacts: [
      {
        account_id: "none",
        birthday: null,
        company_name: null,
        emails: [{ email: "nylascypresstest@gmail.com", type: "work" }],
        given_name: "Nylas Contact #1",
        id: "string",
        source: null,
        im_addresses: [],
        job_title: null,
        manager_name: null,
        middle_name: null,
        nickname: null,
        notes: null,
        object: "object",
        office_location: null,
        phone_numbers: [],
        physical_addresses: [],
        picture_url: null,
        suffix: null,
        surname: null,
        web_pages: [],
        groups: [],
      },
    ],
    ...args,
  },
});

export const LoadedData = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
  },
});

export const EmptyState = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    contacts: [],
    ...args,
  },
});
