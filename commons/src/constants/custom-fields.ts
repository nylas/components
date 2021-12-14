import type { CustomField } from "@commons/types/Scheduler";

export const DefaultCustomFields: CustomField[] = [
  {
    title: "Your Name",
    type: "text",
    required: false,
  },
  {
    title: "Email Address",
    type: "text",
    required: true,
    placeholder: "you@example.com",
  },
];
