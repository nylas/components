import { thread1, thread2 } from "./test-data.js";
const threads = [thread1, thread2];
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

// TODO: We need to intercept network requests in order to ensure we have less flaky tests
// and they become more deterministic.

describe("MailBox  component", () => {
  const defaultSize = 13;

  beforeEach(() => {
    cy.visitMailbox();
  });

  it("Shows Mailbox with demo id and threads", () => {
    const nylasEmail = cy
      .get("nylas-mailbox")
      .shadow()
      .find("nylas-email", { timeout: 10000 });
    nylasEmail.should("exist");
    nylasEmail.should("have.length.greaterThan", 1);
  });

  describe("Unread statuses", () => {
    it("Shows Mailbox with unread status as default", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;

          cy.get(component).find("nylas-email").should("have.length", 2);
          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", 1);
        });
    });

    it("Shows attached file", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          cy.get(component)
            .find("nylas-email")
            .then((element) => {
              const email = element[0];
              cy.get(email)
                .find(".email-row.condensed .attachment")
                .should("exist");
              cy.get(email)
                .find(".email-row.condensed .attachment.desktop button")
                .should("have.text", "invoice_2062.pdf ");
            });
        });
    });

    it("Shows empty message", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = [EMPTY_THREAD];
          cy.get(component)
            .find("nylas-email")
            .then((element) => {
              const email = element[0];
              cy.get(email)
                .find(".no-messages-warning-container")
                .should("exist")
                .and(($div) => {
                  expect($div).to.contain(
                    "Sorry, looks like this thread is currently unavailable",
                  );
                });
            });
        });
    });

    it("Shows draft message", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = [DRAFT_THREAD];
          cy.get(component)
            .find("nylas-email")
            .then((element) => {
              const email = element[0];
              cy.get(email)
                .find(".no-messages-warning-container")
                .should("exist")
                .and(($div) => {
                  expect($div).to.contain("This is a draft email");
                });
            });
        });
    });

    it("Renders inline file appropriately", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          // Assumes that this returns only 1 thread for this keyword
          component.keyword_to_search = "Inline image rendering";
          cy.get(component).find(".email-row.condensed").click();
          cy.get(component)
            .find("nylas-message-body")
            .then((bodyElement) => {
              const messageBodyComponent = bodyElement[0];
              cy.get(messageBodyComponent)
                .find('img[alt="Streams Automation.jpg"]')
                .should("exist");
              cy.get(messageBodyComponent)
                .find('img[alt="Streams Automation.jpg"]')
                .should("not.have.attr", "src", "cid:ii_kwwc5np40");
              cy.get(messageBodyComponent)
                .find('img[alt="Streams Automation.jpg"]')
                .should("have.attr", "src")
                .and(($div) => {
                  expect($div).to.contain("data:image/jpeg");
                });
            });
        });
    });

    it("Shows Mailbox with unread status as unread", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads.map((thread) => ({
            ...thread,
            unread: true,
          }));

          cy.get(component).find("nylas-email").should("have.length", 2);
          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", 2);
        });
    });

    it("Shows Mailbox with unread status as read", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads.map((thread) => ({
            ...thread,
            unread: false,
          }));
          cy.get(component).find("li").should("have.length", 2);
          cy.get(component).find("li.unread").should("have.length", 0);
        });
    });

    it("Marks emails as unread", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads.map((thread) => ({
            ...thread,
            unread: false,
          }));

          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", 0);

          cy.get(component)
            .find("div.checkbox-container")
            .first()
            .find("input")
            .check();
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-read]")
            .should("not.exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-unread]")
            .should("exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-unread]")
            .click();
          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", 1);
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-read]")
            .should("exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-unread]")
            .should("not.exist");
        });
    });

    it("Marks emails as read", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads.map((thread) => ({
            ...thread,
            unread: true,
          }));

          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", threads.length);

          cy.get(component)
            .find("div.checkbox-container")
            .first()
            .find("input")
            .check();
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-unread]")
            .should("not.exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-read]")
            .should("exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-read]")
            .click();
          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", 1);
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-unread]")
            .should("exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status")
            .find("button[data-cy=mark-read]")
            .should("not.exist");
        });
    });
  });

  describe("Stars", () => {
    it("Shows mailbox with no stars when show_star=false", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.show_star = false;

          cy.get(component).find("nylas-email").should("have.length", 2);
          cy.get(component)
            .find(".email-row.condensed")
            .find("div.starred")
            .should("not.exist");
        });
    });

    it("Shows mailbox with stars when show_star=true", () => {
      cy.get("nylas-mailbox").then((element) => {
        const component = element[0];
        component.all_threads = threads;
        component.show_star = true;

        cy.get(component).find("nylas-email").should("have.length", 2);
        cy.get(component)
          .find(".email-row.condensed")
          .find("div.starred")
          .should("have.length", 2);
      });
    });
  });

  describe("Shows and hides thread checkbox", () => {
    it("shows by default", () => {
      cy.get("nylas-mailbox").then((element) => {
        const component = element[0];

        cy.get(component)
          .get(".thread-checkbox")
          .should("have.length", defaultSize + 1);
      });
    });

    it("hides if set to false", () => {
      cy.get("nylas-mailbox").then(([element]) => {
        element.show_thread_checkbox = false;
        cy.get(element).get(".thread-checkbox").should("have.length", 0);
      });
    });
  });

  describe("Mailbox header", () => {
    it("Refresh button works", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const mailbox = element[0];
          mailbox.header = "Default";
          mailbox.all_threads = [thread1];
          mailbox.addEventListener("refreshClicked", function () {
            mailbox.all_threads = threads; // on click make it two threads
          });

          cy.get(mailbox).find("header").should("exist");
          cy.get(mailbox).find(".email-row.condensed").should("have.length", 1);
          cy.get(mailbox).find("header button").click();
          cy.get(mailbox).find(".email-row.condensed").should("have.length", 2);
        });
    });

    it("Shows and hides Mailbox actions bar", () => {
      cy.get("nylas-mailbox").then(([el]) => {
        el.actions_bar = ["selectall", "star", "delete", "unread"];
        cy.get(el).find("div[role='toolbar']").should("exist");
      });

      cy.get("nylas-mailbox").then(([el]) => {
        el.actions_bar = [];
        cy.get(el).find("div[role='toolbar']").should("not.exist");
      });
    });
  });

  describe("Pagination", () => {
    // change these if default emails per page and total number of demo mailbox threads are changed.

    const demoThreadsCount = 39;

    it(`Shows Mailbox with ${defaultSize} emails per page as default`, () => {
      let remainingThreads = demoThreadsCount;
      while (remainingThreads > 0) {
        if (remainingThreads >= defaultSize) {
          cy.get("nylas-mailbox")
            .find("nylas-email", { timeout: 10000 })
            .should("have.length", defaultSize);
        } else {
          cy.get("nylas-mailbox")
            .find("nylas-email", { timeout: 10000 })
            .should("have.length", remainingThreads);
        }
        remainingThreads -= defaultSize;
        if (remainingThreads > 0) {
          cy.get("pagination-nav").get(".next-btn").click();
        }
      }
    });

    // TODO: write test with non-default pagination; tests for buttons
    it("Number of emails per page changes when items_per_page prop is changed", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.items_per_page = 1;

          cy.get(component).find("nylas-email").should("have.length", 1);
          cy.get(component).get("pagination-nav").get(".next-btn").click();
          cy.get(component).find("nylas-email").should("have.length", 1);
        });
    });

    it("Pagination buttons functionality", () => {
      cy.get("pagination-nav").get(".last-btn").click();
      cy.get("pagination-nav").get(".next-btn").should("be.disabled");
      cy.get("pagination-nav").get(".last-btn").should("be.disabled");

      cy.get("pagination-nav").get(".first-btn").click();
      cy.get("pagination-nav").get(".first-btn").should("be.disabled");
      cy.get("pagination-nav").get(".back-btn").should("be.disabled");
    });

    it("Should display correct number of items on the last page", () => {
      cy.get("nylas-mailbox").then((element) => {
        const itemsPerPage = 10;
        const component = element[0];
        component.items_per_page = itemsPerPage;

        cy.get("pagination-nav").get(".last-btn").click();
        cy.get("pagination-nav")
          .get(".page-indicator .page-end")
          .then((pageEndElem) => {
            const pageEnd = pageEndElem.text();
            cy.get("pagination-nav")
              .get(".page-indicator .total")
              .then((totalElem) => {
                const total = totalElem.text();
                expect(total).to.equal(pageEnd);

                const lastPageitems = Number(total) % itemsPerPage;
                cy.get(component)
                  .find("nylas-email", { timeout: 10000 })
                  .should("have.length", itemsPerPage);
              });
          });
      });
    });
  });

  describe("Delete action", () => {
    // TODO: write when Folders are implemented
    xit("Should delete selected email", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actions_bar = ["delete"];
          cy.get("nylas-email").should("have.length", threads.length);
          cy.get(component)
            .find("div.checkbox-container")
            .first()
            .find("input")
            .check();
          cy.get("div[role='toolbar']")
            .find("div.delete")
            .find("button")
            .click();
          cy.get("nylas-email").should("have.length", threads.length - 1);
        });
    });
  });

  describe("Bulk actions", () => {
    it("Should mark all unread then read", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actions_bar = ["selectall", "unread"];

          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.thread-checkbox")
            .find("input")
            .check();
          cy.get(component)
            .find("div.checkbox-container")
            .find("input")
            .each((checkbox) => {
              expect(checkbox).to.be.checked;
            });

          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status button[data-cy=mark-read]")
            .should("exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status button[data-cy=mark-unread]")
            .should("not.exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status button[data-cy=mark-read]")
            .click();
          cy.get(component)
            .find(".email-row")
            .each((email) => {
              cy.wrap(email).should("not.have.class", "unread");
            });

          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status button[data-cy=mark-unread]")
            .should("exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status button[data-cy=mark-read]")
            .should("not.exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.read-status button[data-cy=mark-unread]")
            .click();
          cy.get(component)
            .find(".email-row")
            .each((email) => {
              cy.wrap(email).should("have.class", "unread");
            });
        });
    });

    it("Should star all the emails", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actions_bar = ["selectall", "star"];
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.thread-checkbox")
            .find("input")
            .check();

          cy.get(component)
            .find("div.checkbox-container")
            .find("input")
            .each((checkbox) => {
              expect(checkbox).to.be.checked;
            });
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.starred button.starred")
            .should("not.exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.starred button")
            .click();
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.starred button.starred")
            .should("exist");
          cy.get(component)
            .find("nylas-email")
            .each((email) => {
              cy.wrap(email)
                .find("div.starred button")
                .should("have.class", "starred");
            });

          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.starred button")
            .click();
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.starred button.starred")
            .should("not.exist");
          cy.get(component)
            .find("nylas-email")
            .find("div.starred")
            .find("button.starred")
            .should("not.exist");
        });
    });

    it("Should only show Mailbox actions when an email is selected", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          // component.actions_bar = ["selectall", "unread", "delete", "star"];
          cy.get(component)
            .get("div[role='toolbar']")
            .find("div")
            .should("have.length", 1);

          cy.get(component)
            .find("div.checkbox-container")
            .first()
            .find("input")
            .check();
          cy.get(component)
            .get("div[role='toolbar']")
            .find("div")
            .should("have.length", 4);
        });
    });

    // TODO: finish when Folders are implemented in Mailbox
    xit("Should delete all the emails and show empty mailbox", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actions_bar = ["selectall", "delete"];
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.thread-checkbox")
            .find("input")
            .check();

          cy.get(component)
            .find("div.checkbox-container")
            .find("input")
            .each((checkbox) => {
              cy.wrap(checkbox).should("be.checked");
            });
          cy.get(component).find("nylas-email").should("not.have.length", 0);
          cy.get(component).find("mailbox-empty").should("not.exist");
          cy.get(component)
            .find("div[role='toolbar']")
            .find("div.delete button")
            .click();
          cy.get(component).find("nylas-email").should("not.exist");
          cy.get(component).find("mailbox-empty").should("exist");
        });
    });
  });

  describe("Custom data", () => {
    it("Should toggle between threads via props and fetched threads", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          const cyComponent = cy.wrap(component);
          component.all_threads = threads;
          cy.get(component)
            .get("ul#mailboxlist")
            .find("li")
            .should("have.length", 2)
            .then(() => {
              component.all_threads = null;
              cy.wait(1000);
              cyComponent
                .get("ul#mailboxlist")
                .find("li")
                .should("have.length", 13);
            });
        });
    });
  });
});
