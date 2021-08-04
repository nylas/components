import type { SvelteComponent } from "svelte";
import ContactList from "../ContactList.svelte";
import type { HydratedContact } from "@commons/types/Contacts";

export default {
  title: "Contactlist/onClick",
  component: ContactList,
  argTypes: {
    click_action: {
      control: {
        type: "inline-radio",
        options: ["email", "select"],
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
}

export const EmailAction = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
  },
});

export const SelectAction = (args: ContactListArgs): ContactListProps => ({
  Component: ContactList,
  props: {
    id: componentID,
    ...args,
    click_action: "select",
  },
});
