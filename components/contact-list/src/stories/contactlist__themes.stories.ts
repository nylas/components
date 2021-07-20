import type { SvelteComponent } from "svelte";
import ContactList from "../ContactList.svelte";

export default {
  title: "Contactlist/Themes",
  component: ContactList,
  argTypes: {
    theme: {
      control: {
        type: "inline-radio",
        options: ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"],
      },
    },
  },
};

const componentID = "81137b54-bd3e-4c46-b3a5-6aa189ba6095"; // web@components.com user

interface ContactListProps {
  Component: typeof SvelteComponent;
  props: {
    id?: string;
    contacts?: Contacts.HydratedContact[] | null;
    theme?: string;
    click_action?: "email" | "select";
    sort_by?: "last_emailed" | "name";
    threads_to_load?: number;
    contacts_to_load?: number;
    default_photo?: string;
  };
}

interface ContactListArgs {
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4";
}

export const Theme1 = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
    theme: "theme-1",
  },
});

export const Theme2 = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
    theme: "theme-2",
  },
});

export const Theme3 = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
    theme: "theme-3",
  },
});

export const Theme4 = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
    theme: "theme-4",
  },
});

export const Theme5 = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
    theme: "theme-5",
  },
});
