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
      files: [],
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

describe("Email component", () => {
  beforeEach(() => {
    cy.visit("/components/email/src/index.html");
    cy.get("nylas-email").should("exist");
  });

  it("Shows Email with demo id and thread", () => {
    cy.get("nylas-email").find(".subject").should("exist");
    cy.get("nylas-email").find(".subject").should("contain", "Demo Thread");
  });
  it("Shows Email with passed thread", () => {
    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[1];
        component.thread = SAMPLE_THREAD;
        cy.get(component).find(".subject").should("exist");
        cy.get(component).find(".subject").should("contain", "Super great");
      });
  });
  it("Shows a single email with passed message_id and no thread/thread_id", () => {
    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[2];
        component.id = "demo-email";
        component.thread_id = undefined;
        component.thread = undefined;
        component.message_id = "3r5mx1zidx0a424j34jocc3no";
        cy.get(component)
          .find(".email-row.expanded.singular header")
          .should("exist");
        cy.get(component)
          .find(".email-row.expanded.singular header")
          .should("contain", "Re: Demo Thread");
        cy.get(component).find(".message-body").should("exist");
        cy.get(component).find(".message-body").should("contain", "Bye!");
        cy.get(component).find(".name").should("exist");
        cy.get(component).find(".name").should("contain", "Test User");
        cy.get(component).find(".email-row.expanded.singular header").click();
        cy.get(component)
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
        cy.get(component).find(".message-date span").should("exist");
        cy.get(component)
          .find(".message-date span")
          .should("contain", "July 7");
        cy.get(component)
          .find(".message-to span")
          .should("contain", "Pooja Guggari");
      });
  });
  it("Shows a thread even when message_id is passed", () => {
    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[0];
        component.message_id = "ew8xkdd7aov1xkxqfed5l5mvt";
        cy.get(component).find(".email-row.singular").should("not.exist");
        cy.get(component).find(".email-row.condensed").should("exist");
      });
  });
  it("Shows a message when a full message is passed", () => {
    cy.get("nylas-email")
      .as("email")
      .then((element) => {
        const component = element[3];
        component.message = SAMPLE_THREAD.messages[0];
        cy.get(component).find(".email-row.singular").should("exist");
        cy.get(component).find(".email-row.condensed").should("not.exist");
      });
  });
  describe("Stars", () => {
    // TODO: stars aren't showing up when property is changed
    it("Shows no stars when show_star=false", () => {
      cy.get("nylas-email")
        .as("email")
        .then((element) => {
          const component = element[1];
          component.show_star = false;
          cy.get(component).find("div.starred").should("not.exist");
        });
    });

    it("Shows stars when show_star=true", () => {
      cy.get("nylas-email")
        .as("email")
        .then((element) => {
          const component = element[1];
          component.show_star = true;
          cy.get(component).find("div.starred").should("exist");
        });
    });

    it("Updates starred status via clicking", () => {
      cy.get("nylas-email")
        .as("email")
        .then((element) => {
          const component = element[1];
          component.show_star = "true";
          cy.get(component).find("div.starred").should("exist");
          cy.get(component)
            .find("div.starred")
            .find("button")
            .should("not.have.class", "starred");
          cy.get(component).find("div.starred").find("button").click();
          cy.get(component).find("button").should("have.class", "starred");
          cy.get(component).find("button.starred").click();
          cy.get(component).find("button").should("not.have.class", "starred");
        });
    });
  });
  describe("Unread status", () => {
    // test setting prop
    it("Updates unread status via component prop", () => {
      cy.get("nylas-email")
        .as("email")
        .then((element) => {
          const component = element[0];
          cy.get(component).find(".unread").should("not.exist");
          component.unread = "true";
          cy.get(component).find(".unread").should("exist");
        });
    });
    // test clicking
    it("Updates unread status via clicking", () => {
      cy.get("nylas-email")
        .as("email")
        .then((element) => {
          const component = element[1];
          component.thread = SAMPLE_THREAD;
          cy.get(component).find(".unread").should("exist");
          cy.get(component).find(".email-row").click();
          cy.get(component).find(".email-row.expanded header").click();
          cy.get(component).find(".unread").should("not.exist");
        });
    });
  });

  describe("Toggle email of sender/recipient", () => {
    it("When tooltip trigger is clicked", () => {
      cy.get("nylas-email").then((element) => {
        const component = element[2];
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
      cy.get("nylas-email").then((element) => {
        const component = element[2];
        cy.get(component)
          .find("nylas-tooltip")
          .then((element) => {
            const firstTooltip = element[0];
            const secondTooltip = element[1];
            cy.get(secondTooltip).find(".tooltip").should("not.exist");
            cy.get(secondTooltip).find(".tooltip-trigger").click();
            cy.get(secondTooltip).find(".tooltip").should("exist");
            cy.get(secondTooltip)
              .find(".tooltip")
              .should("contain", "pooja.g@nylas.com");
            cy.get(firstTooltip).find(".tooltip-trigger").click();
            cy.get(firstTooltip).find(".tooltip").should("exist");
            cy.get(firstTooltip)
              .find(".tooltip")
              .should("contain", "nylascypresstest@gmail.com");
            cy.get(secondTooltip).find(".tooltip").should("not.exist");
          });
      });
    });
    it("When tooltip trigger is clicked multiple times", () => {
      cy.get("nylas-email").then((element) => {
        const component = element[3];
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
              .should("contain", "notifications@github.com");
            cy.get(firstTooltip).find(".tooltip-trigger").click();
            cy.get(firstTooltip).find(".tooltip").should("not.exist");
            // second toggle
            cy.get(firstTooltip).find(".tooltip-trigger").click();
            cy.get(firstTooltip).find(".tooltip").should("exist");
            cy.get(firstTooltip)
              .find(".tooltip")
              .should("contain", "notifications@github.com");
            cy.get(firstTooltip).find(".tooltip-trigger").click();
            cy.get(firstTooltip).find(".tooltip").should("not.exist");
            // third toggle
            cy.get(firstTooltip).find(".tooltip-trigger").click();
            cy.get(firstTooltip).find(".tooltip").should("exist");
            cy.get(firstTooltip)
              .find(".tooltip")
              .should("contain", "notifications@github.com");
            cy.get(firstTooltip).find(".tooltip-trigger").click();
            cy.get(firstTooltip).find(".tooltip").should("not.exist");
          });
      });
    });
    it("Accessibility attributes are set by default", () => {
      cy.get("nylas-email").then((element) => {
        const component = element[2];
        cy.get(component)
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
    });
    it("Accessibility attributes change when tooltip trigger is clicked", () => {
      cy.get("nylas-email").then((element) => {
        const component = element[2];
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
});
