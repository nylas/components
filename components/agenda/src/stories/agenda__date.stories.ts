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
  title: "Agenda/Date",
  component: Agenda,
  argTypes: {
    auto_time_box: {
      control: {
        type: "boolean",
      },
    },
    show_date_header: {
      control: {
        type: "inline-radio",
        options: ["full", "day", "none"],
      },
    },
    selected_date: {
      control: {
        type: "inline-radio",
        options: [yesterday, new Date(), tomorrow, dayAfterTom],
      },
    },
    allowed_dates: {
      control: {
        type: "inline-radio",
        options: [
          [new Date(), tomorrow, dayAfterTom],
          [yesterday, new Date()],
          [tomorrow, dayAfterTom],
        ],
      },
    },
  },
};

export const CustomDate = (): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    header_type: "full",
    selected_date: tomorrow,
    auto_time_box: true,
  },
});

export const allowed_dates = (): AgendaProps => ({
  Component: Agenda,
  props: {
    id: componentID,
    header_type: "full",
    allow_date_change: true,
    allowed_dates: [new Date(), tomorrow, dayAfterTom],
    auto_time_box: false,
  },
});
