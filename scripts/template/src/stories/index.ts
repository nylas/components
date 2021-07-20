import type { SvelteComponent } from "svelte";
import Component from "../index.svelte";

export default {
  title: "$NAME$",
  component: Component,
  argTypes: {},
};

const componentID = "$NAME$-demo";

interface Props {
  Component: typeof SvelteComponent;
  props: {
    id?: string;
  };
}

export const StaticData = (): Props => ({
  Component: Component,
  props: {
    id: componentID,
  },
});
