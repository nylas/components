import type { CustomField } from "@commonstypes/Booking";

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
