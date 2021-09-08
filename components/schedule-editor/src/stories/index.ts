import type { SvelteComponent } from "svelte";
import Component from "../index.svelte";

export default {
  title: "schedule-editor",
  component: Component,
  argTypes: {},
};

const componentID = "schedule-editor-demo";

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
