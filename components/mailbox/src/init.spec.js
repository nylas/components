import { thread1, thread2 } from "./test-data.js";
const threads = [thread1, thread2];

describe("MailBox  component", () => {
  const defaultSize = 13;

  beforeEach(() => {
    cy.visitMailbox();
  });

  xit("Shows Mailbox with demo id and threads", () => {
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
          component.unread_status = "default";

          cy.get(component).find("nylas-email").should("have.length", 2);
          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", 1);
        });
    });

    it("Shows Mailbox with unread status as unread", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.unread_status = "unread";

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
          component.all_threads = threads;
          component.unread_status = "read";

          cy.get(component).find("nylas-email").should("have.length", 2);
          cy.get(component)
            .find(".email-row.condensed.unread")
            .should("have.length", 0);
        });
    });

    it("Marks emails as unread", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.unread_status = "read";

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
          component.all_threads = threads;
          component.unread_status = "unread";

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
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
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
      cy.get("nylas-mailbox").then(([element]) => {
        cy.get(element)
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
        el.actionsBar = ["selectall", "star", "delete", "unread"];
        cy.get(el).find("div[role='toolbar']").should("exist");
      });

      cy.get("nylas-mailbox").then(([el]) => {
        el.actionsBar = [];
        cy.get(el).find("div[role='toolbar']").should("not.exist");
      });
    });
  });

  describe("Pagination", () => {
    // change these if default emails per page and total number of demo mailbox threads are changed

    const demoThreadsCount = 37;

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
          cy.get(component)
            .get("pagination-nav")
            .get(".page-numbers")
            .find(".paginate-btn")
            .should("have.length", 2);

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
  });

  describe("Delete action", () => {
    // TODO: write when Folders are implemented
    xit("Should delete selected email", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actionsBar = ["delete"];
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
    it("Should only show Mailbox actions when an email is selected", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actionsBar = ["selectall", "unread", "delete", "star"];
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

    it("Should mark all unread then read", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actionsBar = ["selectall", "unread"];

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
            .find("nylas-email")
            .find(".email-row.condensed.unread")
            .should("not.exist");
        });
    });

    it("Should star all the emails", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actionsBar = ["selectall", "star"];
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

    // TODO: finish when Folders are implemented in Mailbox
    xit("Should delete all the emails and show empty mailbox", () => {
      cy.get("nylas-mailbox")
        .as("mailbox")
        .then((element) => {
          const component = element[0];
          component.all_threads = threads;
          component.actionsBar = ["selectall", "delete"];
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
});
