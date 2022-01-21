const SAMPLE_THREAD = {
  account_id: "cou6r5tjgubx9rswikzvz9afb",
  drafts: [],
  first_message_timestamp: 1613494375,
  has_attachments: true,
  id: "c7ksnn0zyweivc3bcjnd9miwb",
  labels: [
    {
      display_name: "Important",
      id: "qu2u9kjbafk1xgfd1qr3auv4",
      name: "important",
    },
    {
      display_name: "All Mail",
      id: "2j0dp79lsxxw8fa4y57yszmw9",
      name: "all",
    },
    {
      display_name: "Sent Mail",
      id: "4t2d14mxzlushnbgtlknxf7e0",
      name: "sent",
    },
  ],
  last_message_received_timestamp: 1613703916,
  last_message_sent_timestamp: 1613748385,
  last_message_timestamp: 1613748385,
  messages: [
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [],
      date: 1613494375,
      files: [
        {
          content_disposition: "attachment",
          content_type: "application/pdf",
          filename: "invoice_2062.pdf",
          id: "d1fop1j6savk2dqex9uvwvclt",
          size: 27174,
        },
      ],
      from: [
        {
          email: "hazik.a@nylas.com",
          name: "Dude Hazik Afzal",
        },
      ],
      id: "9xve7hesnpz2hryr4met53lb",
      labels: [
        {
          display_name: "All Mail",
          id: "2j0dp79lsxxw8fa4y57yszmw9",
          name: "all",
        },
      ],
      object: "message",
      reply_to: [],
      snippet:
        "Hello folks, Need your help with something. Phil can you reply all to this email and then Chantal can you reply all to his email? Jimmy can you please reply only back to me? Thanks, Hazik",
      starred: false,
      subject: "This is a test email.",
      thread_id: "c7ksnn0zyweivc3bcjnd9miwb",
      to: [
        {
          email: "chantal.l@nylas.com",
          name: "Chantal Lam",
        },
        {
          email: "jimmy@nylas.com",
          name: "Jimmy Hooker",
        },
        {
          email: "phil.r@nylas.com",
          name: "Phil Renaud",
        },
      ],
      unread: false,
    },
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [
        {
          email: "hazik.a@nylas.com",
          name: "Hazik Afzal",
        },
        {
          email: "jimmy@nylas.com",
          name: "Jimmy Hooker",
        },
      ],
      date: 1613747327,
      files: [],
      from: [
        {
          email: "phil.r@nylas.com",
          name: "Phil Renaud",
        },
      ],
      id: "eq2srrv67nm0gv72vt4a7elt9",
      labels: [
        {
          display_name: "Sent Mail",
          id: "4t2d14mxzlushnbgtlknxf7e0",
          name: "sent",
        },
      ],
      object: "message",
      reply_to: [],
      snippet: "Testing out reply status --Sent with Nylas",
      starred: false,
      subject: "This is a test email.",
      thread_id: "c7ksnn0zyweivc3bcjnd9miwb",
      to: [
        {
          email: "chantal.l@nylas.com",
          name: "Chantal Lam",
        },
      ],
      unread: false,
    },
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [
        {
          email: "hazik.a@nylas.com",
          name: "Hazik Afzal",
        },
        {
          email: "jimmy@nylas.com",
          name: "Jimmy Hooker",
        },
      ],
      date: 1613748385,
      files: [],
      from: [
        {
          email: "phil.r@nylas.com",
          name: "Phil Renaud",
        },
      ],
      id: "5f1z1rujk2onjyre85n0lexen",
      labels: [
        {
          display_name: "Sent Mail",
          id: "4t2d14mxzlushnbgtlknxf7e0",
          name: "sent",
        },
      ],
      object: "message",
      reply_to: [],
      snippet: "Testing with updated commons! --Sent with Nylas",
      starred: false,
      subject: "This is a test email.",
      thread_id: "c7ksnn0zyweivc3bcjnd9miwb",
      to: [
        {
          email: "chantal.l@nylas.com",
          name: "Chantal Lam",
        },
      ],
      unread: false,
    },
  ],
  object: "thread",
  participants: [
    {
      email: "jimmy@nylas.com",
      name: "Jimmy Hooker",
    },
    {
      email: "chantal.l@nylas.com",
      name: "Chantal Lam",
    },
    {
      email: "hazik.a@nylas.com",
      name: "Hazik Afzal",
    },
    {
      email: "phil.r@nylas.com",
      name: "Phil Renaud",
    },
  ],
  snippet: "Testing with updated commons! --Sent with Nylas",
  starred: false,
  subject: "This is a Super great test email.",
  unread: true,
  version: 63,
};

const EMPTY_THREAD = {
  account_id: "cou6r5tjgubx9rswikzvz9afb",
  drafts: [],
  first_message_timestamp: 1613494375,
  has_attachments: true,
  id: "c7ksnn0zyweivc3bcjnd9miwb",
  labels: [
    {
      display_name: "Important",
      id: "qu2u9kjbafk1xgfd1qr3auv4",
      name: "important",
    },
    {
      display_name: "All Mail",
      id: "2j0dp79lsxxw8fa4y57yszmw9",
      name: "all",
    },
    {
      display_name: "Sent Mail",
      id: "4t2d14mxzlushnbgtlknxf7e0",
      name: "sent",
    },
  ],
  last_message_received_timestamp: 1613703916,
  last_message_sent_timestamp: 1613748385,
  last_message_timestamp: 1613748385,
  messages: [],
  object: "thread",
  participants: [
    {
      email: "jimmy@nylas.com",
      name: "Jimmy Hooker",
    },
    {
      email: "chantal.l@nylas.com",
      name: "Chantal Lam",
    },
    {
      email: "hazik.a@nylas.com",
      name: "Hazik Afzal",
    },
    {
      email: "phil.r@nylas.com",
      name: "Phil Renaud",
    },
  ],
  snippet: "Testing with updated commons! --Sent with Nylas",
  starred: false,
  subject: "This is a Super great test email.",
  unread: true,
  version: 63,
};

const DRAFT_THREAD = {
  ...EMPTY_THREAD,
  labels: [
    ...EMPTY_THREAD.labels,
    {
      display_name: "Draft",
      id: "qu2u9kjbafk1xgfd1qr3auv4",
      name: "drafts",
    },
  ],
};

const SINGLE_SENDER_MESSAGE = {
  account_id: "cou6r5tjgubx9rswikzvz9afb",
  bcc: [],
  cc: [
    {
      email: "phil.r@nylas.com",
      name: "Phil Renaud",
    },
    {
      email: "review_requested@noreply.github.com",
      name: "Review requested",
    },
  ],
  date: 1621472861,
  files: [],
  from: [
    {
      email: "notifications@github.com",
      name: "Mostafa Rashed",
    },
  ],
  id: "epgslj6wocxcnuyy6h9yyle6v",
  labels: [
    {
      display_name: "Inbox",
      id: "3fhdx7sufj12vbhhjm5ecwcm4",
      name: "inbox",
    },
  ],
  object: "message",
  reply_to: [
    {
      email:
        "reply+AAFOKBZZTCUKW3S3KF62NIF6WGLV3EVBNHHDK2QOAM@reply.github.com",
      name: "nylas/nylas-nodejs",
    },
  ],
  snippet:
    "Description #227 added support for event metadata, this PR enhances this feature and allows for a user to query metadata using either the metadata_key, or metadata_value, or metadata_pair par",
  starred: false,
  subject:
    "[nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
  thread_id: "db8z5xg97si2qio9z7md84fgk",
  to: [
    {
      email: "nylas-nodejs@noreply.github.com",
      name: "nylas/nylas-nodejs",
    },
  ],
  unread: true,
};

const SINGLE_SENDER_THREAD = {
  account_id: "cou6r5tjgubx9rswikzvz9afb",
  drafts: [],
  first_message_timestamp: 1621472861,
  has_attachments: false,
  id: "db8z5xg97si2qio9z7md84fgk",
  labels: [
    {
      display_name: "Inbox",
      id: "3fhdx7sufj12vbhhjm5ecwcm4",
      name: "inbox",
    },
  ],
  last_message_received_timestamp: 1621472865,
  last_message_sent_timestamp: null,
  last_message_timestamp: 1621472865,
  messages: [
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [
        {
          email: "phil.r@nylas.com",
          name: "Phil Renaud",
        },
        {
          email: "review_requested@noreply.github.com",
          name: "Review requested",
        },
      ],
      date: 1621472861,
      files: [],
      from: [
        {
          email: "notifications@github.com",
          name: "Mostafa Rashed",
        },
      ],
      id: "epgslj6wocxcnuyy6h9yyle6v",
      labels: [
        {
          display_name: "Inbox",
          id: "3fhdx7sufj12vbhhjm5ecwcm4",
          name: "inbox",
        },
      ],
      object: "message",
      reply_to: [
        {
          email:
            "reply+AAFOKBZZTCUKW3S3KF62NIF6WGLV3EVBNHHDK2QOAM@reply.github.com",
          name: "nylas/nylas-nodejs",
        },
      ],
      snippet:
        "Description #227 added support for event metadata, this PR enhances this feature and allows for a user to query metadata using either the metadata_key, or metadata_value, or metadata_pair par",
      starred: false,
      subject:
        "[nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
      thread_id: "db8z5xg97si2qio9z7md84fgk",
      to: [
        {
          email: "nylas-nodejs@noreply.github.com",
          name: "nylas/nylas-nodejs",
        },
      ],
      unread: true,
    },
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      body: "This is some manually-created body text. It's allowed to fully deviate from the snippet and you can even <marquee>include some html</marquee>",
      cc: [
        {
          email: "phil.r@nylas.com",
          name: "Phil Renaud",
        },
        {
          email: "review_requested@noreply.github.com",
          name: "Review requested",
        },
      ],
      date: 1621472862,
      files: [],
      from: [
        {
          email: "notifications@github.com",
          name: "Mostafa Rashed",
        },
      ],
      id: "alix2bbga2afjikdma1q0jbyc",
      labels: [
        {
          display_name: "Inbox",
          id: "3fhdx7sufj12vbhhjm5ecwcm4",
          name: "inbox",
        },
      ],
      object: "message",
      reply_to: [
        {
          email:
            "reply+AAFOKBZZTCUKW3S3KF62NIF6WGLV3EVBNHHDK2QOAM@reply.github.com",
          name: "nylas/nylas-nodejs",
        },
      ],
      snippet:
        "@mrashed-dev requested your review on: #228 [59911] Add support for querying event metadata. — You are receiving this because your review was requested. Reply to this email directly, view it ",
      starred: false,
      subject:
        "Re: [nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
      thread_id: "db8z5xg97si2qio9z7md84fgk",
      to: [
        {
          email: "nylas-nodejs@noreply.github.com",
          name: "nylas/nylas-nodejs",
        },
      ],
      unread: true,
    },
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [
        {
          email: "phil.r@nylas.com",
          name: "Phil Renaud",
        },
        {
          email: "review_requested@noreply.github.com",
          name: "Review requested",
        },
      ],
      date: 1621472865,
      files: [],
      from: [
        {
          email: "notifications@github.com",
          name: "clubhouse[bot]",
        },
      ],
      id: "dyo31yp47hbrb5nj90a1s5j5c",
      labels: [
        {
          display_name: "Inbox",
          id: "3fhdx7sufj12vbhhjm5ecwcm4",
          name: "inbox",
        },
      ],
      object: "message",
      reply_to: [
        {
          email:
            "reply+AAFOKB4ULDXTTZHEL54A4LF6WGLWDEVBNHHDK2QOAM@reply.github.com",
          name: "nylas/nylas-nodejs",
        },
      ],
      snippet:
        "This pull request has been linked to Clubhouse Story #59911: Node SDK - Add support for querying event metadata. — You are receiving this because your review was requested. Reply to this emai",
      starred: false,
      subject:
        "Re: [nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
      thread_id: "db8z5xg97si2qio9z7md84fgk",
      to: [
        {
          email: "nylas-nodejs@noreply.github.com",
          name: "nylas/nylas-nodejs",
        },
      ],
      unread: true,
    },
  ],
  object: "thread",
  participants: [
    {
      email: "review_requested@noreply.github.com",
      name: "Review requested",
    },
    {
      email: "notifications@github.com",
      name: "clubhouse[bot]",
    },
    {
      email: "notifications@github.com",
      name: "Mostafa Rashed",
    },
    {
      email: "nylas-nodejs@noreply.github.com",
      name: "nylas/nylas-nodejs",
    },
    {
      email: "phil.r@nylas.com",
      name: "Phil Renaud",
    },
  ],
  snippet:
    "This pull request has been linked to Clubhouse Story #59911: Node SDK - Add support for querying event metadata. — You are receiving this because your review was requested. Reply to this emai",
  starred: false,
  subject:
    "[nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
  unread: true,
  version: 1,
};

const MULTIPLE_SENDER_MESSAGE = {
  account_id: "1xrddnl99frq3b7son9j32aba",
  bcc: [],
  body: "Allo bonjour <br /><br /> --Sent with Nylas",
  cc: [
    {
      email: "test@nylas.com",
      name: "Real User",
    },
  ],
  date: 1634858431,
  events: [],
  files: [],
  from: [
    {
      email: "c@c.com",
      name: "The Letter C",
    },
  ],
  id: "affxolvozy2pcqh4303w7pc9n",
  labels: [
    {
      display_name: "INBOX",
      id: "dx62wkpj57erbkargbr3zew3j",
      name: "inbox",
    },
    {
      display_name: "All Mail",
      id: "78im4dxnn2mj0hl038vcnezwn",
      name: "all",
    },
    {
      display_name: "SENT",
      id: "17ocjrnqb2w5m402t1lwswkkl",
      name: "sent",
    },
  ],
  object: "message",
  reply_to: [],
  snippet: "Allo bonjour --Sent with Nylas",
  starred: false,
  subject: "Alphabet Soup",
  thread_id: "ak2q46em0srqkh7vri8f8vuqj",
  to: [
    {
      email: "nylascypresstest@gmail.com",
      name: "Test User",
    },
    {
      email: "a@a.com",
      name: "The Letter A",
    },
    {
      email: "b@b.com",
      name: "The Letter b",
    },
  ],
  unread: false,
};

const MULTIPLE_SENDER_THREAD = {
  account_id: "cou6r5tjgubx9rswikzvz9afb",
  drafts: [],
  first_message_timestamp: 1621472861,
  has_attachments: false,
  id: "db8z5xg97si2qio9z7md84fgk",
  labels: [
    {
      display_name: "Inbox",
      id: "3fhdx7sufj12vbhhjm5ecwcm4",
      name: "inbox",
    },
  ],
  last_message_received_timestamp: 1621472865,
  last_message_sent_timestamp: null,
  last_message_timestamp: 1621472865,
  messages: [
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [],
      date: 1621472861,
      files: [],
      from: [
        {
          email: "c@c.com",
          name: "The Letter C",
        },
      ],
      id: "epgslj6wocxcnuyy6h9yyle6v",
      labels: [
        {
          display_name: "Inbox",
          id: "3fhdx7sufj12vbhhjm5ecwcm4",
          name: "inbox",
        },
      ],
      object: "message",
      reply_to: [],
      snippet:
        "Description #227 added support for event metadata, this PR enhances this feature and allows for a user to query metadata using either the metadata_key, or metadata_value, or metadata_pair par",
      starred: false,
      subject:
        "[nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
      thread_id: "db8z5xg97si2qio9z7md84fgk",
      to: [
        {
          email: "nylascypresstest@gmail.com",
          name: "Test User",
        },
        {
          email: "a@a.com",
          name: "The Letter A",
        },
        {
          email: "b@b.com",
          name: "The Letter b",
        },
      ],
      unread: true,
    },
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [],
      date: 1621472861,
      files: [],
      from: [
        {
          email: "c@c.com",
          name: "The Letter C",
        },
      ],
      id: "epgslj6wocxcnuyy6h9yyle6v",
      labels: [
        {
          display_name: "Inbox",
          id: "3fhdx7sufj12vbhhjm5ecwcm4",
          name: "inbox",
        },
      ],
      object: "message",
      reply_to: [],
      snippet:
        "Description #227 added support for event metadata, this PR enhances this feature and allows for a user to query metadata using either the metadata_key, or metadata_value, or metadata_pair par",
      starred: false,
      subject:
        "[nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
      thread_id: "db8z5xg97si2qio9z7md84fgk",
      to: [
        {
          email: "nylascypresstest@gmail.com",
          name: "Test User",
        },
        {
          email: "a@a.com",
          name: "The Letter A",
        },
        {
          email: "b@b.com",
          name: "The Letter b",
        },
      ],
      unread: true,
    },
    {
      account_id: "cou6r5tjgubx9rswikzvz9afb",
      bcc: [],
      cc: [],
      date: 1621472861,
      files: [],
      from: [
        {
          email: "c@c.com",
          name: "The Letter C",
        },
      ],
      id: "epgslj6wocxcnuyy6h9yyle6v",
      labels: [
        {
          display_name: "Inbox",
          id: "3fhdx7sufj12vbhhjm5ecwcm4",
          name: "inbox",
        },
      ],
      object: "message",
      reply_to: [],
      snippet:
        "Description #227 added support for event metadata, this PR enhances this feature and allows for a user to query metadata using either the metadata_key, or metadata_value, or metadata_pair par",
      starred: false,
      subject:
        "[nylas/nylas-nodejs] [59911] Add support for querying event metadata (#228)",
      thread_id: "db8z5xg97si2qio9z7md84fgk",
      to: [
        {
          email: "nylascypresstest@gmail.com",
          name: "Test User",
        },
        {
          email: "a@a.com",
          name: "The Letter A",
        },
        {
          email: "b@b.com",
          name: "The Letter b",
        },
      ],
      unread: true,
    },
  ],
  object: "thread",
  participants: [
    {
      email: "nylascypresstest@gmail.com",
      name: "Test User",
    },
    {
      email: "a@a.com",
      name: "The Letter A",
    },
    {
      email: "b@b.com",
      name: "The Letter b",
    },
    {
      email: "c@c.com",
      name: "The Letter C",
    },
  ],
  snippet: "Alphabet Soup",
  starred: false,
  subject: "Alphabet Soup",
  unread: true,
  version: 1,
};

describe("Email: Displays threads and messages", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/c5xjcjlhzldqctpud8zeufa6t",
      {
        fixture: "email/messages/idWithImage.json",
      },
    ).as("messageWithImage");
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/affxolvozy2pcqh4303w7pc9n",
      {
        fixture: "email/messages/id.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "email/account.json",
    });
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/files/6dywzoo80moag1it135co9zv8/download",
      {
        fixture: "email/files/download.json",
      },
    ).as("filesDownload");

    cy.visit("/components/email/src/cypress.html");

    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[0];
        component.show_expanded_email_view_onload = false;
      });
  });

  it("Shows Email with demo id and thread", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.thread_id = "b3z0fd5kbbwcxvf4q1ele5us6";
    });

    cy.get("@email").find(".subject").should("exist");
    cy.get("@email").find(".subject").should("contain", "Test");
  });

  it("Shows Email with passed thread", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.thread = SAMPLE_THREAD;

      cy.get(component).find(".subject").should("exist");
      cy.get(component).find(".subject").should("contain", "Super great");
    });
  });

  it("Shows a single email with passed message_id and no thread/thread_id", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.thread_id = undefined;
      component.thread = undefined;
      component.message_id = "affxolvozy2pcqh4303w7pc9n";
    });

    cy.get("@email")
      .find(".email-row.expanded.singular header")
      .should("contain", "Demo Thread");
    cy.get("@email").find("nylas-message-body").contains("Allo bonjour");
    cy.get("@email").find(".name").contains("me");
    cy.get("@email").find(".message-to").contains("Test User");
    cy.get("@email").find(".email-row.expanded.singular header").click();
    cy.get("@email")
      .find("nylas-tooltip")
      .then((element) => {
        const tooltip = element[0];
        cy.get(tooltip).find(".tooltip-trigger").should("exist");
        cy.get(tooltip).find(".tooltip-trigger").click();
        cy.get(tooltip)
          .find(".tooltip")
          .should("contain", "nylascypresstest@gmail.com");
        cy.get(tooltip).find(".tooltip-trigger").click();
        cy.get(tooltip).find(".tooltip").should("not.exist");
      });
    cy.get("@email").find(".message-date").contains("October 21");
    cy.get("@email").find(".message-to").contains("Me");
  });

  it("Shows a thread even when message_id is passed", (done) => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.message_id = "affxolvozy2pcqh4303w7pc9n";
      setTimeout(() => {
        cy.get(component).find(".email-row.singular").should("not.exist");
        cy.get(component).find(".email-row.condensed").should("exist");
        done();
      }, 100);
    });
  });

  it("Shows a message when a full message is passed", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.message = SAMPLE_THREAD.messages[0];
    });

    cy.get("@email").find(".email-row.singular").should("exist");
    cy.get("@email").find(".email-row.condensed").should("not.exist");
  });

  it("Sanitizes markup in the email body", (done) => {
    const stub = cy.stub();
    cy.on("window:alert", stub);

    cy.on("window:alert", stub);
    cy.get("@email").then((element) => {
      const component = element[0];
      component.style = "position: absolute; top: 0";
      component.message = {
        ...SAMPLE_THREAD.messages[0],
        body: `<img src=x onerror=alert(1)//>`,
      };
      setTimeout(() => {
        expect(stub).not.to.be.called;
        done();
      }, 50);
    });
  });

  it("Renders inline file appropriately", () => {
    cy.intercept("GET", "https://web-components.nylas.com/middleware/manifest");

    cy.get("@email").then((element) => {
      const component = element[0];
      // Replace thread id of the first email component
      component.thread_id = "c5xjcjlhzldqctpud8zeufa6t";
      component.click_action = "default";
    });

    cy.get("@email").find(".email-row.condensed").click();

    cy.wait("@filesDownload");

    cy.get("@email")
      .find("img[alt='Streams Automation.jpg']")
      .should("have.attr", "src")
      .and(($div) => {
        expect($div).to.contain("data:image/jpeg");
      });
  });

  it("Shows attached file when condensed", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_expanded_email_view_onload = false;
      component.thread = SAMPLE_THREAD;
    });

    cy.get("@email").find(".email-row.condensed .attachment").should("exist");
    cy.get("@email")
      .find(".email-row.condensed .attachment button")
      .should("have.text", "invoice_2062.pdf ");
  });

  it("Shows empty message", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_expanded_email_view_onload = false;
      component.thread = EMPTY_THREAD;
    });

    cy.get("@email")
      .find(".snippet")
      .should("exist")
      .and(($div) => {
        expect($div).to.contain(
          "Sorry, looks like this thread is currently unavailable",
        );
      });
  });

  it("Shows draft message", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_expanded_email_view_onload = false;
      component.thread = DRAFT_THREAD;
    });

    cy.get("@email")
      .find(".snippet")
      .should("exist")
      .and(($div) => {
        expect($div).to.contain(
          "Sorry, looks like this thread is currently unavailable",
        );
      });
  });
});

describe("Email: Stars", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "email/account.json",
    });

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/affxolvozy2pcqh4303w7pc9n",
      {
        fixture: "email/messages/id.json",
      },
    );

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads/b3z0fd5kbbwcxvf4q1ele5us6",
    );

    cy.visit("/components/email/src/cypress.html");

    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[0];
        component.thread_id = "b3z0fd5kbbwcxvf4q1ele5us6";
      });
  });

  // TODO: stars aren't showing up when property is changed
  it("Shows no stars when show_star=false", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_star = false;
      cy.get(component).find("div.starred").should("not.exist");
    });
  });

  it("Shows stars when show_star=true", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_star = true;
      cy.get(component).find("div.starred").should("exist");
    });
  });

  it("Updates starred status via clicking", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.click_action = "default";
      component.show_star = true;

      cy.get("@email").find("div.starred").should("exist");
      cy.get("@email")
        .find("div.starred")
        .find("button")
        .then(($btn) => {
          let isStarred = $btn.hasClass("starred");
          cy.get("@email")
            .shadow()
            .findByLabelText("Star button for thread b3z0fd5kbbwcxvf4q1ele5us6")
            .click();
          if (isStarred) {
            cy.wrap($btn).should("not.have.class", "starred");
          } else {
            cy.wrap($btn).should("have.class", "starred");
          }
        });
    });
  });
});

describe("Email: Unread status", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "email/account.json",
    });

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/affxolvozy2pcqh4303w7pc9n",
      {
        fixture: "email/messages/id.json",
      },
    );

    cy.visit("/components/email/src/cypress.html");

    cy.get("nylas-email").as("email");
  });

  // test setting prop
  it("Updates unread status via component prop", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.thread = { ...SAMPLE_THREAD, unread: false };
      cy.get(component)
        .find(".unread")
        .should("not.exist")
        .then(() => {
          component.thread = { ...component.thread, unread: true };
          cy.get(component).find(".unread").should("exist");
        });
    });
  });

  it("Updates unread status via clicking", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.thread = SAMPLE_THREAD;
      component.show_expanded_email_view_onload = false;
      component.click_action = "default";
    });

    cy.get("@email").find(".unread").should("exist");
    cy.get("@email").find(".email-row").click();
    cy.get("@email").find(".unread").should("not.exist");
  });
});

describe("Email: Reply, Reply-all, Forward", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "email/account.json",
    });

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/affxolvozy2pcqh4303w7pc9n",
      {
        fixture: "email/messages/id.json",
      },
    );

    cy.visit("/components/email/src/cypress.html");

    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[0];
        component.thread_id = "83v13r9lj6kzh109c3l1yznnf";
        component.show_expanded_email_view_onload = true;
      });
  });

  it("shows reply icon", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_reply = true;
    });

    cy.get("@email").find(".reply").should("exist");
  });

  it("shows reply-all icon", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_reply_all = true;
    });

    cy.get("@email").find(".reply-all").should("exist");
  });

  it("shows forward icon", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_forward = true;
    });

    cy.get("@email").find(".forward").should("exist");
  });
});

describe("Email: Toggle email of sender/recipient", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "email/account.json",
    });

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/affxolvozy2pcqh4303w7pc9n",
      {
        fixture: "email/messages/id.json",
      },
    );

    cy.visit("/components/email/src/cypress.html");

    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[0];
        component.thread_id = "b3z0fd5kbbwcxvf4q1ele5us6";
        component.show_expanded_email_view_onload = true;
      });
  });

  it("When tooltip trigger is clicked", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      cy.get(component)
        .find("nylas-tooltip")
        .then((element) => {
          const firstTooltip = element[0];
          cy.get(firstTooltip).find(".tooltip-trigger").should("exist");
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("exist");
          cy.get(firstTooltip)
            .find(".tooltip")
            .should("contain", "nylascypresstest@gmail.com");
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("not.exist");
        });
    });
  });

  it("Does not show more than one tooltip", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      cy.get(component)
        .find("nylas-tooltip")
        .then((element) => {
          const firstTooltip = element[0];
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("exist");
          cy.get(firstTooltip)
            .find(".tooltip")
            .should("contain", "nylascypresstest@gmail.com");
        });
    });
  });

  it("When tooltip trigger is clicked multiple times", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      cy.get(component)
        .find("nylas-tooltip")
        .then((element) => {
          const firstTooltip = element[0];
          cy.get(firstTooltip).find(".tooltip-trigger").should("exist");
          // first toggle
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("exist");
          cy.get(firstTooltip)
            .find(".tooltip")
            .should("contain", "nylascypresstest@gmail.com");
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("not.exist");
          // second toggle
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("exist");
          cy.get(firstTooltip)
            .find(".tooltip")
            .should("contain", "nylascypresstest@gmail.com");
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("not.exist");
          // third toggle
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("exist");
          cy.get(firstTooltip)
            .find(".tooltip")
            .should("contain", "nylascypresstest@gmail.com");
          cy.get(firstTooltip).find(".tooltip-trigger").click();
          cy.get(firstTooltip).find(".tooltip").should("not.exist");
        });
    });
  });

  it("Accessibility attributes are set by default", () => {
    cy.get("@email")
      .find("nylas-tooltip")
      .then((element) => {
        const tooltip = element[0];
        cy.get(tooltip)
          .find(".tooltip-trigger")
          .invoke("attr", "aria-expanded")
          .should("eq", "false");
        cy.get(tooltip)
          .find(".tooltip-trigger")
          .invoke("attr", "aria-label")
          .should("eq", "show email");
        cy.get(tooltip)
          .find(".tooltip-trigger")
          .invoke("attr", "aria-describedby")
          .should("exist");
        cy.get(tooltip)
          .find(".tooltip-trigger svg")
          .invoke("attr", "aria-hidden")
          .should("eq", "true");
      });
  });

  it("Accessibility attributes change when tooltip trigger is clicked", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      cy.get(component)
        .find("nylas-tooltip")
        .then((element) => {
          const tooltip = element[0];

          cy.get(tooltip).find(".tooltip-trigger").click();
          cy.get(tooltip)
            .find(".tooltip")
            .invoke("attr", "tabindex")
            .should("eq", "0");
          cy.get(tooltip)
            .find(".tooltip")
            .invoke("attr", "role")
            .should("eq", "tooltip");
          cy.get(tooltip)
            .find(".tooltip")
            .invoke("attr", "id")
            .then(($tooltipID) => {
              cy.get(tooltip)
                .find(".tooltip-trigger")
                .invoke("attr", "aria-describedby")
                .then(($ariaDescribedby) => {
                  expect($tooltipID).to.be.equal($ariaDescribedby);
                });
            });
          cy.get(tooltip)
            .find(".tooltip-trigger")
            .invoke("attr", "aria-expanded")
            .should("eq", "true");
          cy.get(tooltip)
            .find(".tooltip-trigger")
            .invoke("attr", "aria-label")
            .should("eq", "hide email");
          cy.get(tooltip).find(".tooltip-trigger").click();
          cy.get(tooltip)
            .find(".tooltip-trigger")
            .invoke("attr", "aria-expanded")
            .should("eq", "false");
          cy.get(tooltip)
            .find(".tooltip-trigger")
            .invoke("attr", "aria-label")
            .should("eq", "show email");
        });
    });
  });
});

describe("Should Render Reply Button And Dispatch Event When Clicked", () => {
  beforeEach(() => {
    cy.visit("/components/email/src/cypress.html");

    cy.get("nylas-email").as("email");

    cy.get("@email").invoke("attr", "show_reply", "true");
  });

  it("Should Render Reply Button When Passed A Message", () => {
    cy.get("@email").invoke("prop", "message", SINGLE_SENDER_MESSAGE);
    cy.get("@email").find("div.reply button").should("exist");
  });

  it("Should Render Reply Button When Passed A Thread", () => {
    cy.get("@email").invoke("prop", "thread", SAMPLE_THREAD);
    cy.get("@email").invoke("attr", "show_expanded_email_view_onload", "true");
    cy.get("@email").find("div.reply button").as("replyButton");
    cy.get("@replyButton").should("exist");
  });

  it("Should Render Reply Button When Passed A Message ID", () => {
    cy.intercept(
      {
        method: "GET",
        url: "**/messages/d0byfc378l2728z35pax362ho",
      },
      {
        fixture: "email/messages/id.json",
      },
    ).as("messageRequest");

    cy.get("@email").invoke("attr", "message_id", "d0byfc378l2728z35pax362ho");
    cy.wait("@messageRequest");

    cy.get("@email").find("div.reply button").should("exist");
  });

  it("Should Render Reply Button When Passed A Thread ID", () => {
    cy.intercept(
      {
        method: "GET",
        url: "**/threads/e2k5xktxejdok7d8x28ljf44d?view=expanded",
      },
      {
        fixture: "email/threads/id.json",
      },
    ).as("threadRequest");

    cy.intercept(
      {
        method: "GET",
        url: "**/messages/*",
      },
      {
        fixture: "email/messages/id.json",
      },
    );

    cy.get("@email").invoke("attr", "show_expanded_email_view_onload", "true");
    cy.get("@email").invoke("attr", "thread_id", "e2k5xktxejdok7d8x28ljf44d");
    cy.wait("@threadRequest");
    cy.get("@email").find("div.reply button").should("exist");
  });

  it("Should Dispatch Event When Reply Button Is Clicked", () => {
    cy.get("@email").invoke("prop", "message", SINGLE_SENDER_MESSAGE);
    cy.get("@email").find("div.reply button").as("replyButton");
    cy.get("@replyButton").should("exist");
    cy.get("@email").then((elements) => {
      const component = elements[0];
      component.addEventListener("replyClicked", cy.stub().as("replyClicked"));
    });
    cy.get("@replyButton").click();
    cy.get("@replyClicked").should("have.been.calledOnce");
  });
});

describe("Should Render Reply All Button And Respond To Clicks", () => {
  beforeEach(() => {
    cy.visit("/components/email/src/cypress.html");

    cy.get("nylas-email").as("email");

    cy.get("@email").invoke("attr", "show_reply_all", "true");
  });

  it("Should Render Reply All Button When Passed A Message", () => {
    cy.get("@email").invoke("prop", "message", MULTIPLE_SENDER_MESSAGE);
    cy.get("@email").find("div.reply-all button").should("exist");
  });

  it("Should Render Reply All Button When Passed A Thread", () => {
    cy.get("@email").invoke("prop", "thread", MULTIPLE_SENDER_THREAD);
    cy.get("@email").invoke("attr", "show_expanded_email_view_onload", "true");
    cy.get("@email").find("div.reply-all button").should("exist");
  });

  it("Should Render Reply All Button When Passed A Message ID", () => {
    cy.intercept(
      {
        method: "GET",
        url: "**/messages/d0byfc378l2728z35pax362ho",
      },
      {
        fixture: "email/messages/idWithMultipleSenders.json",
      },
    ).as("messageRequest");

    cy.get("@email").invoke("attr", "message_id", "d0byfc378l2728z35pax362ho");
    cy.wait("@messageRequest");

    cy.get("@email").find("div.reply-all button").should("exist");
  });

  it("Should Render Reply All Button When Passed A Thread ID", () => {
    cy.intercept(
      {
        method: "GET",
        url: "**/threads/e2k5xktxejdok7d8x28ljf44d?view=expanded",
      },
      {
        fixture: "email/threads/idWithMultipleSenders.json",
      },
    ).as("threadRequest");

    cy.intercept(
      {
        method: "GET",
        url: "**/messages/*",
      },
      {
        fixture: "email/messages/idWithMultipleSenders.json",
      },
    );

    cy.get("@email").invoke("attr", "show_expanded_email_view_onload", "true");
    cy.get("@email").invoke("attr", "thread_id", "e2k5xktxejdok7d8x28ljf44d");
    cy.wait("@threadRequest");
    cy.get("@email").find("div.reply-all button").should("exist");
  });

  it("Should Not Render Reply All Button When Reply All Option Is Not Available", () => {
    cy.get("@email").invoke("prop", "message", SINGLE_SENDER_MESSAGE);
    cy.get("@email").find("div.reply-all button").should("not.exist");
  });

  it("Should Dispatch Event When Reply All Button Is Clicked", () => {
    cy.get("@email").invoke("prop", "message", MULTIPLE_SENDER_MESSAGE);
    cy.get("@email").find("div.reply-all button").as("replyAllButton");
    cy.get("@replyAllButton").should("exist");

    cy.get("@email").then((elements) => {
      const component = elements[0];
      component.addEventListener(
        "replyAllClicked",
        cy.stub().as("replyAllClicked"),
      );
    });

    cy.get("@replyAllButton").click();
    cy.get("@replyAllClicked").should("have.been.calledOnce");
  });
});
