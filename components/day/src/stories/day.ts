import type { SvelteComponent } from "svelte";
import Day from "../Day.svelte";

export default {
  title: "Day",
  component: Day,
  argTypes: {},
};

const componentID = "day-demo";

interface DayProps {
  Component: typeof SvelteComponent;
  props: {
    id?: string;
  };
}

export const StaticData = (): DayProps => ({
  Component: Day,
  props: {
    id: componentID,
  },
});
