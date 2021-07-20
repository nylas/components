import Composer from "./ComposerStoryBook.svelte";

export default {
  title: "Composer",
  argTypes: {
    visible: {
      control: {
        type: "boolean",
      },
      defaultValue: true,
      table: {
        category: "Interface",
      },
    },
    minimized: {
      control: {
        type: "boolean",
      },
      defaultValue: false,
      table: {
        category: "Interface",
      },
    },
    from: {
      control: "text",
      table: { category: "Values" },
    },
    to: {
      control: "text",
      table: { category: "Values" },
    },
    subject: {
      control: "text",
      table: { category: "Values" },
    },
    body: {
      control: "text",
      table: { category: "Values" },
    },
    theme: {
      control: {
        type: "inline-radio",
        options: ["light", "dark", "light-2", "dark-2"],
      },
      table: {
        category: "Interface",
      },
    },
    show_header: {
      description: "Display header",
      control: {
        type: "boolean",
      },
      table: {
        category: "Interface",
      },
    },
    show_attachment_button: {
      control: {
        type: "boolean",
      },
      defaultValue: true,
      table: {
        category: "Interface",
      },
    },
    show_subject: {
      description: "Show subject field",
      control: {
        type: "boolean",
      },
      table: {
        category: "Interface",
      },
    },
    show_from: {
      description: "Show from field",
      control: {
        type: "boolean",
      },
      table: {
        category: "Interface",
      },
    },
    show_to: {
      description: "Show to field",
      control: {
        type: "boolean",
      },
      table: {
        category: "Interface",
      },
    },
    show_close_button: {
      control: {
        type: "boolean",
      },
      table: {
        category: "Interface",
      },
    },
    show_minimize_button: {
      control: {
        type: "boolean",
      },
      table: {
        category: "Interface",
      },
    },
    show_editor_toolbar: {
      description: "Show Editor Toolbar",
      control: {
        type: "boolean",
      },
      table: {
        category: "Interface",
      },
    },
  },
};

type ComposerProps = {
  body?: string;
  subject?: string;
};

export const RichComposer = ({ ...args }: ComposerProps) => ({
  Component: Composer,
  props: args,
  on: {},
});

RichComposer.args = {
  visible: true,
  subject: "Hello from Nylas",
  body: "This is a sample message body",
  show_header: true,
  show_from: true,
  show_subject: true,
  show_to: true,
  show_editor_toolbar: true,
  show_close_button: true,
  show_minimize_button: true,
  theme: "light",
  from: "dan@nylas.com",
  to: "test@nylas.com",
};

export const MinimalComposer = ({ ...args }: ComposerProps) => ({
  Component: Composer,
  props: args,
  on: {},
});

MinimalComposer.args = {
  visible: true,
  show_header: false,
  show_from: false,
  show_subject: true,
  show_to: true,
  subject: "",
  body: "",
  show_attachment_button: false,
  show_editor_toolbar: false,
  theme: "light",
};
