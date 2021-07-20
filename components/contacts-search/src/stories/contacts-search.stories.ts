import ContactsSearch from "./View.svelte";

export default {
  title: "ContactsSearch",
  Component: ContactsSearch,
  argTypes: {
    body: {
      control: "text",
    },
    subject: { control: "text" },
  },
};

type SearchProps = {
  contacts?: Nylas.Participant[];
};

export const ContactList = ({ ...args }: SearchProps) => ({
  Component: ContactsSearch,
  props: args,
  on: {},
});

ContactList.args = {
  contacts: [
    { id: 1, email: "Tia30@hotmail.com" },
    { id: 2, email: "Obie_Stokes@hotmail.com" },
    { id: 3, email: "Mikayla.Jaskolski85@gmail.com" },
    { id: 4, email: "Jacquelyn65@hotmail.com" },
    { id: 5, email: "Dee57@hotmail.com" },
  ],
};
