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

const DRAFT_MESSAGE = {
  account_id: "cou6r5tjgubx9rswikzvz9afb",
  bcc: [],
  cc: [],
  date: 1642002063,
  files: [],
  body: "Testing with updated commons! --Sent with Nylas",
  from: [
    {
      email: "nylascypresstest@gmail.com",
      name: "Test User",
    },
  ],
  id: "b1bkr18qmjzw6fxaqth2n5liq",
  labels: [
    {
      display_name: "DRAFT",
      id: "qu2u9kjbafk1xgfd1qr3auv4",
      name: "drafts",
    },
  ],
  object: "draft",
  reply_to: [],
  reply_to_message_id: null,
  snippet: "Testing with updated commons! --Sent with Nylas",
  starred: false,
  subject: "This is a Super great test email.",
  thread_id: "2fn0nfkt9a9wi24t91104t83c",
  to: [
    {
      email: "nylascypresstest2@gmail.com",
      name: "",
    },
  ],
  unread: false,
  version: 0,
};

const DRAFT_THREAD = {
  ...EMPTY_THREAD,
  drafts: [DRAFT_MESSAGE],
  labels: [
    ...EMPTY_THREAD.labels,
    {
      display_name: "Draft",
      id: "qu2u9kjbafk1xgfd1qr3auv4",
      name: "drafts",
    },
  ],
};

const defaultSize = 13;

describe("Mailbox Display", () => {
  let thread1;
  let thread2;
  let THREAD_WITH_MESSAGE_THAT_DOES_NOT_HAVE_FROM_OR_TO_FIELDS;

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&limit=13&offset=0&in=inbox",
      {
        fixture: "mailbox/threads/index.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&view=count&in=inbox",
      {
        fixture: "mailbox/threads/threadsWithCount.json",
      },
    );

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&limit=13&offset=0&in=inbox",
      {
        fixture:
          "mailbox/threads/threadWithMessageThatDoesNotHaveFromOrToFields.json",
      },
    );

    cy.fixture(
      "mailbox/threads/threadWithMessageThatDoesNotHaveFromOrToFields.json",
    ).then((f) => {
      THREAD_WITH_MESSAGE_THAT_DOES_NOT_HAVE_FROM_OR_TO_FIELDS = f.response;
    });

    cy.fixture("mailbox/threads/SAMPLE_1.json").then((f) => {
      thread1 = f;
    });
    cy.fixture("mailbox/threads/SAMPLE_2.json").then((f) => {
      thread2 = f;
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");
  });

  it("Shows attached file", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);

    cy.get("@email").find(".email-row.condensed .attachment").should("exist");
    cy.get("@email")
      .find(".email-row.condensed .attachment button")
      .should("have.text", "invoice_2062.pdf ");
  });

  it("Shows empty message", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [EMPTY_THREAD]);
    cy.get("@email")
      .find(".snippet")
      .contains("Sorry, looks like this thread is currently unavailable");
  });

  it("Filters out messages with no 'to' or 'from' fields", () => {
    cy.get("@mailbox").invoke(
      "prop",
      "all_threads",
      THREAD_WITH_MESSAGE_THAT_DOES_NOT_HAVE_FROM_OR_TO_FIELDS,
    );
    cy.get("@email")
      .find(".snippet")
      .contains("Sorry, looks like this thread is currently unavailable");
  });
});

describe("Mailbox Files/Images", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&limit=13&offset=0&in=inbox",
      {
        fixture: "mailbox/threads/threadsWithImage",
      },
    ).as("threadsWithImage");
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/message-id-with-inline-image",
      {
        fixture: "mailbox/messages/idWithImage",
      },
    );

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");
  });
  it("Renders inline file appropriately", () => {
    cy.wait("@threadsWithImage");
    cy.get("@mailbox").find(".email-row.condensed").click();

    cy.get("@mailbox")
      .find('img[alt="Streams Automation.jpg"]')
      .should("exist")
      .as("messageImage");
    cy.get("@messageImage").should("not.have.attr", "src", "cid:ii_kwwc5np40");
    cy.get("@messageImage")
      .should("have.attr", "src")
      .and("contain", "data:image/jpeg");
  });
});

describe("Mailbox Unread/Read", () => {
  let thread1;
  let thread2;

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });

    cy.fixture("mailbox/threads/SAMPLE_1.json").then((f) => {
      thread1 = f;
    });
    cy.fixture("mailbox/threads/SAMPLE_2.json").then((f) => {
      thread2 = f;
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
  });

  it("Shows Mailbox with unread status as default", () => {
    cy.fixture("mailbox/threads/SAMPLE_1.json").as("threads");
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);

    cy.get("@mailbox")
      .find(".email-row.condensed.unread")
      .should("have.length", 1);
  });

  it("Shows Mailbox with unread status as unread", () => {
    const unreadThreads = [thread1, thread2].map((thread) => ({
      ...thread,
      unread: true,
    }));
    cy.get("@mailbox").invoke("prop", "all_threads", unreadThreads);

    cy.get("@mailbox").find("nylas-email").should("have.length", 2);
    cy.get("@mailbox")
      .find(".email-row.condensed.unread")
      .should("have.length", 2);
  });

  it("Shows Mailbox with unread status as read", () => {
    const unreadThreads = [thread1, thread2].map((thread) => ({
      ...thread,
      unread: false,
    }));
    cy.get("@mailbox").invoke("prop", "all_threads", unreadThreads);

    cy.get("@mailbox").find("li").should("have.length", 2);
    cy.get("@mailbox").find("li.unread").should("have.length", 0);
  });

  it("Marks emails as unread", () => {
    const unreadThreads = [thread1, thread2].map((thread) => ({
      ...thread,
      unread: false,
    }));
    cy.get("@mailbox").invoke("prop", "all_threads", unreadThreads);

    cy.get("@mailbox")
      .find(".email-row.condensed.unread")
      .should("have.length", 0);
    cy.get("@mailbox").find(".checkbox-container input").first().check();

    cy.get("@mailbox").find("button[data-cy=mark-read]").should("not.exist");
    cy.get("@mailbox").find("button[data-cy=mark-unread]").should("exist");
    cy.get("@mailbox").find("button[data-cy=mark-unread]").click();

    cy.get("@mailbox")
      .find(".email-row.condensed.unread")
      .should("have.length", 1);
    cy.get("@mailbox").find("button[data-cy=mark-read]").should("exist");
    cy.get("@mailbox").find("button[data-cy=mark-unread]").should("not.exist");
  });

  it("Marks emails as read", () => {
    const unreadThreads = [thread1, thread2].map((thread) => ({
      ...thread,
      unread: true,
    }));
    cy.get("@mailbox").invoke("prop", "all_threads", unreadThreads);

    cy.get("@mailbox")
      .find(".email-row.condensed.unread")
      .should("have.length", 2);
    cy.get("@mailbox").find(".checkbox-container input").first().check();

    cy.get("@mailbox").find("button[data-cy=mark-unread]").should("not.exist");
    cy.get("@mailbox").find("button[data-cy=mark-read]").click();

    cy.get("@mailbox")
      .find(".email-row.condensed.unread")
      .should("have.length", 1);
    cy.get("@mailbox").find("button[data-cy=mark-unread]").should("exist");
    cy.get("@mailbox").find("button[data-cy=mark-read]").should("not.exist");
  });
});

describe("Mailbox Props", () => {
  let thread1;
  let thread2;

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&view=count&in=inbox",
      {
        fixture: "mailbox/threads/threadsWithCount.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&limit=13&offset=0&in=inbox",
      {
        fixture: "mailbox/threads/index.json",
      },
    ).as("threads");

    cy.fixture("mailbox/threads/SAMPLE_1.json").then((f) => {
      thread1 = f;
    });
    cy.fixture("mailbox/threads/SAMPLE_2.json").then((f) => {
      thread2 = f;
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");
  });

  it("Shows mailbox with no stars when show_star=false", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").invoke("prop", "show_star", false);

    cy.get("@email").should("have.length", 2);
    cy.get("@mailbox")
      .find(".email-row.condensed")
      .find(".starred")
      .should("not.exist");
  });

  it("Shows mailbox with stars when show_star=true", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").invoke("prop", "show_star", true);

    cy.get("@email").should("have.length", 2);
    cy.get("@mailbox")
      .find(".email-row.condensed")
      .find(".starred")
      .should("have.length", 2);
  });

  it("shows thread checkbox by default", () => {
    cy.get("@mailbox")
      .find(".thread-checkbox")
      .should("have.length", defaultSize + 1);
  });

  it("hides if show_thread_checkbox set to false", () => {
    cy.get("@mailbox").invoke("prop", "show_thread_checkbox", false);

    cy.get("@mailbox").find(".thread-checkbox input").should("not.exist");
  });

  it("Shows Mailbox actions bar", () => {
    cy.get("@mailbox").invoke("prop", "actions_bar", [
      "selectall",
      "star",
      "delete",
      "unread",
    ]);
    cy.get("@mailbox").find("div[role='toolbar']").should("exist");
  });

  it("Hides Mailbox actions bar", () => {
    cy.get("@mailbox").invoke("prop", "actions_bar", []);
    cy.get("@mailbox").find("div[role='toolbar']").should("not.exist");
  });

  it("Number of emails per page is items_per_page prop", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").invoke("prop", "items_per_page", 1);

    cy.get("@email").should("have.length", 1);
    cy.get("@mailbox").get("pagination-nav").get(".next-btn").click();
    cy.get("@email").should("have.length", 1);
  });
});

describe("Mailbox Interactions", () => {
  let thread1;
  let thread2;

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });

    cy.fixture("mailbox/threads/SAMPLE_1.json").then((f) => {
      thread1 = f;
    });
    cy.fixture("mailbox/threads/SAMPLE_2.json").then((f) => {
      thread2 = f;
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");
  });

  it("Refresh button works", () => {
    let refreshed = false;
    cy.get("@mailbox").invoke("prop", "header", "Test");
    cy.get("@mailbox").then((element) => {
      const component = element[0];
      component.addEventListener("refreshClicked", function () {
        refreshed = true;
      });
    });

    cy.get("@mailbox")
      .find("header button")
      .click()
      .then(() => {
        expect(refreshed);
      });
  });

  it("Cancel delete with delete confirmation pop up", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").invoke("prop", "actions_bar", ["delete"]);

    cy.get("@email").should("have.length", 2);
    cy.get("@mailbox").find("div.checkbox-container input").first().check();
    cy.get("[role='toolbar']").find(".delete").find("button").click();
    // Clicking delete should open modal
    cy.get(".modal").should("exist");
    // Clicking cancel should close the modal
    cy.get(".modal").find("button.cancel").click();
    cy.get(".modal").should("not.exist");
  });

  it("Confirm delete with delete confirmation pop up", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").invoke("prop", "actions_bar", ["delete"]);

    cy.get("@email").should("have.length", 2);
    cy.get("@mailbox").find("div.checkbox-container input").first().check();
    cy.get("[role='toolbar']").find(".delete").find("button").click();
    // Clicking delete should open modal
    cy.get(".modal").should("exist");
    // Clicking confirm should delete email and close modal
    cy.get(".modal").find("button.danger").click();
    cy.get(".modal").should("not.exist");
    cy.get("@email").should("have.length", 1);
  });
});

describe("Mailbox Pagination: threads not intercepted", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");
  });

  // change these if default emails per page and total number of demo mailbox threads are changed.

  it(`Shows Mailbox with 13 emails per page as default`, () => {
    cy.get("@email").should("have.length", defaultSize);
    cy.get("pagination-nav").get(".next-btn").click();

    cy.get("@email").should("have.length", defaultSize);
    cy.get("pagination-nav").get(".next-btn").click();

    cy.get("@email").should("have.length", defaultSize);
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
    const itemsPerPage = 10;
    cy.get("@mailbox").invoke("prop", "items_per_page", itemsPerPage);

    cy.get("pagination-nav").get(".last-btn").click();
    cy.get("pagination-nav").get(".last-btn").click();

    cy.get("pagination-nav")
      .get(".page-indicator .page-end")
      .then((pageEndElem) => {
        const pageEnd = pageEndElem.text();
        cy.get("pagination-nav")
          .find(".page-indicator .total")
          .then((totalElem) => {
            const total = totalElem.text();
            expect(total).to.equal(pageEnd);

            const lastPageitems = Number(total) % itemsPerPage;
            cy.get("@email").should("have.length", lastPageitems);
          });
      });
  });
});

describe("Mailbox Bulk actions", () => {
  let thread1;
  let thread2;

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&view=count&in=inbox",
      {
        fixture: "mailbox/threads/threadsWithCount.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&limit=13&offset=0&in=inbox",
      {
        fixture: "mailbox/threads/index.json",
      },
    ).as("threads");

    cy.fixture("mailbox/threads/SAMPLE_1.json").then((f) => {
      thread1 = f;
    });
    cy.fixture("mailbox/threads/SAMPLE_2.json").then((f) => {
      thread2 = f;
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");
  });

  it("Should mark all unread to read", () => {
    const unreadThreads = [thread1, thread2].map((thread) => ({
      ...thread,
      unread: true,
    }));
    cy.get("@mailbox").invoke("prop", "all_threads", unreadThreads);
    cy.get("@mailbox").invoke("prop", "actions_bar", ["selectall", "unread"]);

    cy.get("@mailbox").find(".thread-checkbox").find("input").check();
    cy.get("@mailbox")
      .find(".thread-checkbox input")
      .each((checkbox) => {
        expect(checkbox).to.be.checked;
      });

    cy.get("@mailbox").find("[data-cy=mark-read]").click();
    cy.get("@mailbox")
      .find(".email-row")
      .each((email) => {
        cy.wrap(email).should("not.have.class", "unread");
      });
  });

  it("Should mark all read to unread", () => {
    const readThreads = [thread1, thread2].map((thread) => ({
      ...thread,
      unread: false,
    }));
    cy.get("@mailbox").invoke("prop", "all_threads", readThreads);
    cy.get("@mailbox").invoke("prop", "actions_bar", ["selectall", "unread"]);

    cy.get("@mailbox").find(".thread-checkbox").find("input").check();
    cy.get("@mailbox")
      .find(".thread-checkbox input")
      .each((checkbox) => {
        expect(checkbox).to.be.checked;
      });

    cy.get("@mailbox").find("[data-cy=mark-unread]").click();
    cy.get("@mailbox")
      .find(".email-row")
      .each((email) => {
        cy.wrap(email).should("have.class", "unread");
      });
  });

  it("Should star all the emails", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").invoke("prop", "actions_bar", ["selectall", "star"]);
    cy.get("@mailbox").invoke("prop", "show_star", true);

    cy.get("@mailbox").find(".thread-checkbox").find("input").check();

    cy.get("@mailbox")
      .find("div.checkbox-container")
      .find("input")
      .each((checkbox) => {
        expect(checkbox).to.be.checked;
      });
    cy.get("@mailbox")
      .find("[role='toolbar']")
      .find("div.starred button.starred")
      .should("not.exist");
    cy.get("@mailbox")
      .find("[role='toolbar']")
      .find("div.starred button")
      .click();
    cy.get("@mailbox")
      .find("[role='toolbar']")
      .find("div.starred button.starred")
      .should("exist");
    cy.get("@email").each((email) => {
      cy.wrap(email).find("div.starred button").should("have.class", "starred");
    });

    cy.get("@mailbox")
      .find("[role='toolbar']")
      .find("div.starred button")
      .click();
    cy.get("@mailbox")
      .find("[role='toolbar']")
      .find("div.starred button.starred")
      .should("not.exist");
    cy.get("@email")
      .find("div.starred")
      .find("button.starred")
      .should("not.exist");
  });

  it("Should only show Mailbox actions when an email is selected", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);

    cy.get("@mailbox")
      .get("[role='toolbar']")
      .children("div")
      .should("have.length", 1);

    cy.get("@mailbox").find(".checkbox-container input").first().check();
    cy.get("@mailbox")
      .get("[role='toolbar']")
      .children("div")
      .should("have.length", 3);
  });

  it("Should delete all the emails and show empty mailbox", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").invoke("prop", "actions_bar", ["selectall", "delete"]);

    cy.get("@mailbox").find(".thread-checkbox").find("input").check();

    cy.get("@mailbox")
      .find(".checkbox-container input")
      .each((checkbox) => {
        cy.wrap(checkbox).should("be.checked");
      });
    cy.get("@email").should("not.have.length", 0);
    cy.get("@mailbox").find("mailbox-empty").should("not.exist");

    cy.get("@mailbox").find("[role='toolbar']").find(".delete button").click();
    cy.get("@mailbox").find(".overlay button.danger").click(); // confirm delete

    cy.get("@email").should("not.exist");
    cy.get("@mailbox").contains("Your Mailbox is empty!");
  });
});

describe("Mailbox Custom events", () => {
  let thread1;
  let thread2;

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads?view=expanded&not_in=trash&limit=13&offset=0&in=inbox",
      {
        fixture: "mailbox/threads/index.json",
      },
    ).as("threads");

    cy.fixture("mailbox/threads/SAMPLE_1.json").then((f) => {
      thread1 = f;
    });
    cy.fixture("mailbox/threads/SAMPLE_2.json").then((f) => {
      thread2 = f;
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");
  });

  xit("Should successfully update a thread's message body when threadClicked is called", () => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/messages/3ozrqu3obfwzmsltxj72ll86m ",
      {
        fixture: "mailbox/messages/id.json",
      },
    );

    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").then((element) => {
      const component = element[0];

      component.addEventListener("threadClicked", function (event) {
        let { thread } = event.detail;
        thread = {
          ...thread,
          messages: thread.messages.map((m) => {
            m.body = "This is a custom body";
            return m;
          }),
        };
      });
    });

    cy.get("@mailbox").find(".email-row.condensed").first().click();
    cy.get("@mailbox").contains("This is a custom body");
  });

  it("Should toggle between threads via props and fetched threads", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [thread1, thread2]);
    cy.get("@mailbox").find("#mailboxlist").find("li").should("have.length", 2);

    cy.get("@mailbox").invoke("prop", "all_threads", null);
    cy.get("@mailbox")
      .find("#mailboxlist")
      .find("li")
      .should("have.length", 13);
  });
});

describe("Mailbox Integration: Composer and Drafts", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "mailbox/manifest.json",
      },
    );
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "mailbox/account.json",
    });
    cy.intercept("GET", "https://web-components.nylas.com/middleware/labels", {
      fixture: "mailbox/labels.json",
    });

    cy.visit("/components/mailbox/src/cypress.html");

    cy.get("nylas-mailbox").should("exist").as("mailbox");
    cy.get("@mailbox").find("nylas-email").as("email");

    cy.addComponent("nylas-composer", {
      show_header: true,
      show_minimize_button: false,
      reset_after_send: true,
      reset_after_close: true,
    });

    cy.get("@mailbox").then((el) => {
      const mailbox = el[0];
      cy.get("nylas-composer")
        .should("exist")
        .as("composer")
        .then((el) => {
          const composer = el[0];
          composer.close();

          composer.afterSendSuccess = (data) => {
            composer.close();
          };

          mailbox.addEventListener("draftThreadEvent", (event) => {
            composer.value = event.detail.value;
            composer.open();
          });

          composer.addEventListener("messageSent", (event) => {
            const message = event.detail.message;
            mailbox.sentMessageUpdate(message);
          });
        });
    });
  });

  it("Shows draft message", () => {
    cy.get("@mailbox").invoke("prop", "all_threads", [DRAFT_THREAD]);
    cy.get("@email").find(".participants-name").contains("Draft");
    cy.get("@email")
      .find(".snippet")
      .contains("Testing with updated commons! --Sent with Nylas");
  });

  it("Clicking on a draft message opens composer", () => {
    cy.intercept("https://web-components.nylas.com/middleware/messages/*", {
      fixture: "draftThread.json",
    });
    cy.get("@mailbox").invoke("prop", "all_threads", [DRAFT_THREAD]);

    cy.get("@mailbox").find(".email-row.unread").click();

    cy.get("@composer")
      .find("header")
      .should("contain", "This is a Super great test email.");
    cy.get("@composer")
      .find(".contacts-container")
      .should("contain", "nylascypresstest2@gmail.com");
    cy.get("@composer")
      .find("nylas-html-editor")
      .find("[role='textbox']")
      .invoke("text")
      .should("contain", "Testing with updated commons! --Sent with Nylas");
  });

  it("ENTER keydown on a draft message opens composer", () => {
    cy.intercept("https://web-components.nylas.com/middleware/messages/*", {
      fixture: "draftThread.json",
    });
    cy.get("@mailbox").invoke("prop", "all_threads", [DRAFT_THREAD]);
    cy.get("li.unread").trigger("keypress", { code: "Enter" });

    cy.get("@composer")
      .find("header")
      .should("contain", "This is a Super great test email.");
    cy.get("@composer")
      .find(".contacts-container")
      .should("contain", "nylascypresstest2@gmail.com");
    cy.get("@composer")
      .find("nylas-html-editor")
      .find("[role='textbox']")
      .invoke("text")
      .should("contain", "Testing with updated commons! --Sent with Nylas");
  });
});
