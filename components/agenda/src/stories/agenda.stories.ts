/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SvelteComponent } from "svelte";
import Agenda from "../Agenda.svelte";

export default {
  title: "Agenda",
  component: Agenda,
  argTypes: {
    theme: {
      control: {
        type: "inline-radio",
        options: ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"],
      },
    },
    show_as_busy: {
      control: {
        type: "boolean",
      },
    },
    prevent_zoom: {
      control: {
        type: "boolean",
      },
    },
    hide_current_time: {
      control: {
        type: "boolean",
      },
    },
    auto_time_box: {
      control: {
        type: "boolean",
      },
    },
    color_by: {
      control: {
        type: "inline-radio",
        options: ["calendar", "event"],
      },
    },
    condensed_view: {
      control: {
        type: "boolean",
      },
    },
  },
};

const componentID = "883b9ef6-417b-47fd-b6e3-c7135184c920"; // web@components.com user

export interface AgendaProps {
  Component: typeof SvelteComponent;
  props: {
    events?: Partial<Events.Event>[] | null;
    calendar_id?: string;
    calendar_ids?: string[];
    click_action?: any;
    prevent_zoom?: boolean;
    show_as_busy?: boolean;
    auto_time_box?: boolean;
    theme?: string;
    header_type?: "full" | "day" | "none";
    selected_date?: Date | null;
    hide_current_time?: boolean;
    allowed_dates?: Date[];
    should_show_message_on_no_events?: string;
    allow_date_change?: boolean;
    condensed_view?: boolean | string;
    id?: string;
    color_by?: string;
    start_minute?: number;
    end_minute?: number;
  };
}

interface AgendaArgs {
  theme: "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
  show_as_busy: boolean;
  prevent_zoom: boolean;
  hide_current_time: boolean;
  auto_time_box: boolean;
  color_by: "calendar" | "event";
  condensed_view: boolean;
}

const staticEvents: Partial<Events.Event>[] = [
  {
    title: "Some event that I am manipulating outside of the context of Nylas",
    description: "Passed in from HTML!",
    participants: [],
    when: { end_time: 1600444800, object: "timespan", start_time: 1600438500 },
  },
  {
    title: "Some event I got from elsewhere",
    description: "Passed in from HTML!",
    participants: [],
    when: { end_time: 1600449999, object: "timespan", start_time: 1600448500 },
  },
  {
    title: "A third event of the day",
    description: "Passed in from HTML!",
    participants: [],
    when: { end_time: 1600468500, object: "timespan", start_time: 1600458500 },
  },
];

export const Static = (args: AgendaArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    events: staticEvents,
    ...args,
  },
});

export const Dynamic = (args: AgendaArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    ...args,
  },
});

export const SpecifyCalendar = (args: AgendaArgs): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    calendar_ids: ["2cvy4lhe4kwju9y57btev13pw"],
    ...args,
  },
});
