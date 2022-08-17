const BASE_PATH = Cypress.env("TEST_COVERAGE")
  ? "conversation/src/cypress.html"
  : "/components/conversation/src/cypress.html";

describe("Conversation Loading", () => {
  beforeEach(() => {
    cy.visit(BASE_PATH);
    cy.get("nylas-conversation").should("exist").as("conversation");

    cy.get("header.mobile").as("mobile-header");
    cy.get("header.tablet").as("tablet-header");
  });

  it("Shows Loading Animation for Mobile", () => {
    cy.viewport(320, 500);
    cy.get("@conversation").invoke("attr", "thread_id", "test-thread");
    cy.get("header.mobile.loading").should("be.visible");
  });

  it("Shows Loading Animation for Tablet", () => {
    cy.viewport(768, 500);
    cy.get("header.tablet.loading").should("be.visible");
  });
});

describe("Conversation Mobile/Tablet", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "conversation/manifest.json",
      },
    ).as("getManifest");
    cy.intercept("GET", "https://web-components.nylas.com/middleware/account", {
      fixture: "conversation/account.json",
    }).as("getAccount");
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/threads/test-thread?view=expanded",
      {
        fixture: "conversation/threadsId.json",
      },
    ).as("getThreadId");
    cy.intercept(
      "PUT",
      "https://web-components.nylas.com/middleware/neural/conversation",
    );

    cy.visit(BASE_PATH);
    cy.get("nylas-conversation").should("exist").as("conversation");

    cy.get("header.mobile").as("mobile-header");
    cy.get("header.tablet").as("tablet-header");
    cy.get("@conversation").invoke("attr", "thread_id", "test-thread");
  });

  it("Shows Mobile Header with 'to' Email Address", () => {
    cy.viewport(320, 500);
    cy.get("header.tablet").should("not.be.visible");
    cy.get("@mobile-header").contains("to: bill@outlook.com");
  });

  it("Shows all emails in mobile header when expanded", () => {
    cy.viewport(320, 500);
    cy.get("@mobile-header").find("button").click();
    cy.get("@mobile-header").contains("frank@yahoo.com");
  });

  it("Mobile Header Doesn't Show Duplicate CC Emails", () => {
    cy.viewport(320, 500);
    cy.get("@mobile-header").find("button").click();
    cy.get("@mobile-header")
      .find("button ~ span")
      .should("have.text", "cc: frank@yahoo.com");
  });

  it("Tablet Header Doesn't Show Duplicate CC Emails", () => {
    cy.viewport(768, 500);
    cy.get("@tablet-header").find("span").should("have.length", 2);
    cy.get("@tablet-header")
      .find("span:nth-of-type(2)")
      .should("have.text", "cc: frank@yahoo.com");
  });

  it("Shows Tablet Header with 'to' Email Address", () => {
    cy.viewport(768, 500);
    cy.get("@tablet-header").should("be.visible");
    cy.get("@mobile-header").should("not.be.visible");
    cy.get("@tablet-header")
      .find("span")
      .first()
      .should("have.text", "to: bill@outlook.com");
    cy.get("header.tablet button").should("not.exist");
  });

  it("Changes Between Tablet and Mobile Header When Viewport is Resized", () => {
    cy.viewport(768, 500);
    cy.get("@tablet-header").should("be.visible");
    cy.get("@mobile-header").should("not.be.visible");
    cy.viewport(320, 500);
    cy.get("@tablet-header").should("not.be.visible");
    cy.get("@mobile-header").should("be.visible");
  });

  it("Scrolls to most recent message", () => {
    cy.get(".message").last().should("be.visible");
  });
});

describe("Send messages", () => {
  beforeEach(() => {
    cy.batchIntercept("GET", {
      "**/middleware/manifest": "conversation/manifest",
      "**/middleware/account": "conversation/account",
      "**/middleware/threads/test-converstation-thread-id?view=expanded":
        "conversation/testConversationThread",
    });
    cy.intercept(
      "PUT",
      "https://web-components.nylas.com/middleware/neural/conversation",
    );
    cy.intercept("POST", "https://web-components.nylas.com/middleware/send", {
      fixture: "conversation/sendMessageResponse.json",
    }).as("sendResponse");

    cy.visit(BASE_PATH);
    cy.get("nylas-conversation").should("exist").as("conversation");

    cy.get("header.mobile").as("mobile-header");
    cy.get("header.tablet").as("tablet-header");
    cy.get("@conversation").invoke(
      "attr",
      "thread_id",
      "test-converstation-thread-id",
    );
  });

  it("Sent message will be updated in the view as new message", () => {
    cy.get("@conversation")
      .find(".reply-box input")
      .type("New cypress test message");
    cy.get("@conversation").find(".reply-box form").submit();
    cy.wait("@sendResponse");
    cy.get("@conversation")
      .find(".messages")
      .find("article")
      .should("have.length", 3);
    cy.get("@conversation")
      .find(".messages")
      .find("article")
      .last()
      .should("contain", "New cypress test message");
  });
});
