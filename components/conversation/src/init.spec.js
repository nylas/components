let testConversationComponent;

beforeEach(() => {
  cy.visit("/components/conversation/src/index.html");
  cy.get("nylas-conversation").then((component) => {
    const conversation = component[0];
    conversation.setAttribute("id", "test-conversation");
    testConversationComponent = conversation;
    cy.get(testConversationComponent)
      .should("have.prop", "id")
      .and("equal", "test-conversation");
  });
});

describe("Conversation component (Svelte)", () => {
  beforeEach(() => {
    cy.get("nylas-conversation")
      .should("exist")
      .as("conversation")
      .then(() => {
        cy.get("header.mobile").as("mobile-header");
        cy.get("header.tablet").as("tablet-header");
      });
  });

  it("Shows Loading Animation for Mobile and Tablet Up", () => {
    cy.viewport(320, 500);
    cy.get("header.mobile.loading").should("be.visible");
    cy.viewport(768, 500);
    cy.get("header.tablet.loading").should("be.visible");
  });

  it("Shows Mobile Header with 'to' Email Address", () => {
    cy.viewport(320, 500);
    cy.get("@mobile-header").should("exist");
    cy.get("@tablet-header").should("not.be.visible");
    cy.get("@mobile-header").children().should("have.length", 2);
    cy.get("@mobile-header")
      .find("span")
      .first()
      .should("have.text", "to: nylascypresstest@gmail.com");
    cy.get("@mobile-header").find("button").click();
    cy.get("@mobile-header").children().should("have.length", 3);
  });

  it("Mobile Header Doesn't Show Duplicate CC Emails", () => {
    cy.viewport(320, 500);
    cy.get("@mobile-header").find("button").click();
    cy.get("@mobile-header").find("button ~ span").should("have.length", 1);
    cy.get("@mobile-header")
      .find("button ~ span")
      .should("have.text", "cc: pooja.g@nylas.com");
  });

  it("Tablet Header Doesn't Show Duplicate CC Emails", () => {
    cy.viewport(320, 500);
    cy.get("@tablet-header").find("span").should("have.length", 2);
    cy.get("@tablet-header")
      .find("span:nth-of-type(2)")
      .should("have.text", "cc: pooja.g@nylas.com");
  });

  it("Shows Tablet Header with 'to' Email Address", () => {
    cy.viewport(768, 500);
    cy.get("@tablet-header").should("be.visible");
    cy.get("@mobile-header").should("not.be.visible");
    cy.get("@tablet-header")
      .find("span")
      .first()
      .should("have.text", "to: nylascypresstest@gmail.com");
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
