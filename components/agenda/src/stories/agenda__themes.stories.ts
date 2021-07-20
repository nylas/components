import Agenda from "../Agenda.svelte";
import type { AgendaProps } from "./agenda.stories";

const componentID = "883b9ef6-417b-47fd-b6e3-c7135184c920"; // web@components.com user
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTom = new Date();
dayAfterTom.setDate(dayAfterTom.getDate() + 2);

export default {
  title: "Agenda/Themes",
  component: Agenda,
  argTypes: {
    theme: {
      control: {
        type: "inline-radio",
        options: ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"],
      },
    },
  },
};

interface ThemeArgs {
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
}

export const Theme1 = (args: ThemeArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    auto_time_box: true,
    ...args,
    theme: "theme-1",
  },
});

export const Theme2 = (args: ThemeArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    auto_time_box: true,
    ...args,
    theme: "theme-2",
  },
});

export const Theme3 = (args: ThemeArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    auto_time_box: true,
    ...args,
    theme: "theme-3",
  },
});

export const Theme4 = (args: ThemeArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    auto_time_box: true,
    ...args,
    theme: "theme-4",
  },
});

export const Theme5 = (args: ThemeArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    auto_time_box: true,
    ...args,
    theme: "theme-5",
  },
});
