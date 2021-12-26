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
      .find(".email-row.condensed .attachment.desktop button")
      .should("have.text", "invoice_2062.pdf ");
  });

  it("Shows empty message", () => {
    cy.get("@email").then((element) => {
      const component = element[0];
      component.show_expanded_email_view_onload = false;
      component.thread = EMPTY_THREAD;
    });

    cy.get("@email")
      .find(".no-messages-warning-container")
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
      .find(".no-messages-warning-container")
      .should("exist")
      .and(($div) => {
        expect($div).to.contain("This is a draft email");
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
    });

    cy.get("@email").find("div.starred").should("exist");
    cy.get("@email")
      .shadow()
      .findByLabelText("Star button for thread b3z0fd5kbbwcxvf4q1ele5us6")
      .click();
    cy.get("@email")
      .find("div.starred")
      .find("button")
      .should("have.class", "starred");
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
  it("Should Render Reply Button When Passed A Message", () => {
    cy.visit("/components/email/src/examples/reply-message.html");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply button").should("exist");
    });
  });

  it("Should Render Reply Button When Passed A Thread", () => {
    cy.visit("/components/email/src/examples/reply-thread.html");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply button").should("exist");
    });
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

    cy.visit("/components/email/src/examples/reply-message_id.html");
    cy.wait("@messageRequest");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply button").should("exist");
    });
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

    cy.visit("/components/email/src/examples/reply-thread_id.html");
    cy.wait("@threadRequest");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply button").should("exist");
    });
  });

  it("Should Dispatch Event When Reply Button Is Clicked", () => {
    cy.visit("/components/email/src/examples/reply-message.html");

    cy.get("nylas-email").then((components) => {
      cy.get(components).should("exist");
      cy.get(components).find("div.reply button").as("button");

      cy.get("@button").should("exist");

      components
        .get(0)
        .addEventListener("replyClicked", cy.stub().as("replyClicked"));

      cy.get("@button").click();
      cy.get("@replyClicked").should("have.been.calledOnce");
    });
  });
});

describe("Should Render Reply All Button And Respond To Clicks", () => {
  it("Should Render Reply All Button When Passed A Message", () => {
    cy.visit("/components/email/src/examples/reply-all-message.html");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply-all button").should("exist");
    });
  });

  it("Should Render Reply All Button When Passed A Thread", () => {
    cy.visit("/components/email/src/examples/reply-all-thread.html");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply-all button").should("exist");
    });
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

    cy.visit("/components/email/src/examples/reply-all-message_id.html");
    cy.wait("@messageRequest");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply-all button").should("exist");
    });
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

    cy.visit("/components/email/src/examples/reply-all-thread_id.html");
    cy.wait("@threadRequest");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply-all button").should("exist");
    });
  });

  it("Should Not Render Reply All Button When Reply All Option Is Not Available", () => {
    cy.visit("/components/email/src/examples/reply-all-not-available.html");

    cy.get("nylas-email").then((component) => {
      cy.get(component).should("exist");
      cy.get(component).find("div.reply-all button").should("not.exist");
    });
  });

  it("Should Dispatch Event When Reply All Button Is Clicked", () => {
    cy.visit("/components/email/src/examples/reply-all-message.html");

    cy.get("nylas-email").then((components) => {
      cy.get(components).should("exist");
      cy.get(components).find("div.reply-all button").as("button");

      cy.get("@button").should("exist");

      components
        .get(0)
        .addEventListener("replyAllClicked", cy.stub().as("replyAllClicked"));

      cy.get("@button").click();
      cy.get("@replyAllClicked").should("have.been.calledOnce");
    });
  });
});
