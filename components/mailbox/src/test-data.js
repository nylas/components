var thread1 = {
  account_id: "byh51hf1ru70i28jkxapbwguc",
  drafts: [],
  first_message_timestamp: 1622476262,
  has_attachments: false,
  id: "dknqm7q1h03wagikgq96wlckc",
  labels: [
    { display_name: "Inbox", id: "26z3bxbz3c0grgr0u4ssx7k0g", name: "inbox" },
  ],
  last_message_received_timestamp: 1622476262,
  last_message_sent_timestamp: null,
  last_message_timestamp: 1622476262,
  messages: [
    {
      account_id: "byh51hf1ru70i28jkxapbwguc",
      bcc: [],
      cc: [],
      date: 1622476262,
      files: [],
      from: [{ email: "tips@nylas.com", name: "J Valdivia" }],
      id: "at2uxubcdw5yq4c3xe51wrx3w",
      labels: [
        {
          display_name: "Inbox",
          id: "26z3bxbz3c0grgr0u4ssx7k0g",
          name: "inbox",
        },
      ],
      object: "message",
      reply_to: [{ email: "tips@nylas.com", name: "" }],
      snippet:
        "Build Your First Integration in 15 Minutes With the Nylas SDKs Hey there, We hope your Nylas trial is going well. How far have you made it into your email, calendar, and contacts integration?",
      starred: false,
      subject:
        "Yes, Nylas Can Help You Integrate Email, Calendar, and Contacts",
      thread_id: "dknqm7q1h03wagikgq96wlckc",
      to: [{ email: "nylascypresstest+may261039@gmail.com", name: "" }],
      unread: true,
    },
  ],
  object: "thread",
  participants: [
    { email: "tips@nylas.com", name: "J Valdivia" },
    { email: "nylascypresstest+may261039@gmail.com", name: "" },
  ],
  snippet:
    "Build Your First Integration in 15 Minutes With the Nylas SDKs Hey there, We hope your Nylas trial is going well. How far have you made it into your email, calendar, and contacts integration?",
  starred: false,
  subject: "Yes, Nylas Can Help You Integrate Email, Calendar, and Contacts",
  unread: true,
  version: 0,
};
var thread2 = {
  account_id: "byh51hf1ru70i28jkxapbwguc",
  drafts: [],
  first_message_timestamp: 1621538576,
  has_attachments: false,
  id: "137u2jhasd8tk6w2u0iodj3y7",
  labels: [
    {
      display_name: "Sent Mail",
      id: "4rfh7visxepajc8bzv42y9pnj",
      name: "sent",
    },
  ],
  last_message_received_timestamp: null,
  last_message_sent_timestamp: 1621538576,
  last_message_timestamp: 1621538576,
  messages: [
    {
      account_id: "byh51hf1ru70i28jkxapbwguc",
      bcc: [],
      cc: [],
      date: 1621538576,
      files: [],
      from: [{ email: "nylascypresstest@gmail.com", name: "Test User" }],
      id: "1pjfjnq9p608btkuxxu95pur0",
      labels: [
        {
          display_name: "Sent Mail",
          id: "4rfh7visxepajc8bzv42y9pnj",
          name: "sent",
        },
      ],
      object: "message",
      reply_to: [],
      snippet: "",
      starred: false,
      subject: "Example thread with nylas cypresstest",
      thread_id: "137u2jhasd8tk6w2u0iodj3y7",
      to: [{ email: "aaron.d@nylas.com", name: "" }],
      unread: false,
    },
  ],
  object: "thread",
  participants: [
    { email: "aaron.d@nylas.com", name: "" },
    { email: "nylascypresstest@gmail.com", name: "Test User" },
  ],
  snippet: "",
  starred: false,
  subject: "Example thread with nylas cypresstest",
  unread: false,
  version: 4,
};

export { thread1, thread2 };
