import type { SvelteComponent } from "svelte";
import Email from "../Email.svelte";

export default {
  title: "Email",
  component: Email,
  argTypes: {},
};

const componentID = "email-demo";

interface EmailProps {
  Component: typeof SvelteComponent;
  props: {
    id?: string;
  };
}

export const StaticData = (): EmailProps => ({
  Component: Email,
  props: {
    id: componentID,
  },
});
