import Agenda from "../Agenda.svelte";
import type { AgendaProps } from "./agenda.stories";

const componentID = "883b9ef6-417b-47fd-b6e3-c7135184c920"; // web@components.com user

export default {
  title: "Agenda/Toggles",
  component: Agenda,
  argTypes: {
    auto_time_box: {
      control: {
        type: "boolean",
      },
    },
  },
};

interface ToggleArgs {
  auto_time_box: boolean;
}

export const HideHeader = (args: ToggleArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    header_type: "none",
    ...args,
  },
});

export const PreventZoom = (args: ToggleArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    prevent_zoom: true,
    ...args,
  },
});

export const show_as_busy = (args: ToggleArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    show_as_busy: true,
    ...args,
  },
});

export const hide_current_time = (args: ToggleArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    hide_current_time: true,
    ...args,
  },
});

export const auto_time_box = (args: ToggleArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    ...args,
    auto_time_box: true,
  },
});

export const color_by_event = (args: ToggleArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    color_by: "event",
    ...args,
  },
});

export const condensed_view = (args: ToggleArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    condensed_view: true,
    ...args,
  },
});
