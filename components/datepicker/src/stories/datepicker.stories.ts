import DatepickerComponent from "./DatepickerStoryBook.svelte";

export default {
  title: "Composer/Datepicker",
  argTypes: {
    value: {
      control: {
        type: "date",
      },
      table: {
        category: "Values",
      },
    },
    min: {
      control: {
        type: "date",
      },
      table: {
        category: "Values",
      },
    },
    max: {
      control: "date",
      table: { category: "Values" },
    },
    timepicker: {
      control: "boolean",
      defaultValue: false,
      table: { category: "Interface" },
    },
  },
};

type DatepickerProps = {
  value: Date;
  min?: Date;
  max?: Date;
};

export const DateTimePicker = ({ ...args }: DatepickerProps) => {
  args.value = new Date(args.value);
  args.min = args.min ? new Date(args.min) : undefined;
  args.max = args.max ? new Date(args.max) : undefined;
  return {
    Component: DatepickerComponent,
    props: args,
    on: {},
  };
};

DateTimePicker.args = {
  value: new Date(),
  min: new Date(),
  max: new Date(new Date().getTime() + 604800 * 1000),
  timepicker: true,
};

export const DatePicker = ({ ...args }: DatepickerProps) => {
  args.value = new Date(args.value);
  args.min = args.min ? new Date(args.min) : undefined;
  args.max = args.max ? new Date(args.max) : undefined;
  return {
    Component: DatepickerComponent,
    props: args,
    on: {},
  };
};

DatePicker.args = {
  value: new Date(),
  min: new Date(),
  max: new Date(new Date().getTime() + 604800 * 1000),
};
