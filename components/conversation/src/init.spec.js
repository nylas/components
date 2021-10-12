describe("Conversation component (Svelte)", () => {
  beforeEach(() => {
    cy.visit("/components/conversation/src/index.html");
    cy.get("nylas-conversation").should("exist").as("conversation");
  });

  it("Shows Loading Animation for Mobile and Up", () => {
    cy.viewport(320, 500);
    cy.get("header.mobile.loading").should("be.visible");
    cy.viewport(768, 500);
    cy.get("header.tablet.loading").should("be.visible");
  });

  it("Shows Mobile Header", () => {
    cy.viewport(320, 500);
    cy.get("@conversation").then(() => {
      cy.get("header.mobile").as("mobile-header").should("exist");
      cy.get("header.tablet").should("not.be.visible");
    });
    cy.get("@mobile-header").children().should("have.length", 2);
    cy.get("@mobile-header").find("button").click();
    cy.get("@mobile-header").children().should("have.length", 3);
  });

  it("Shows Tablet Header", () => {
    cy.viewport(768, 500);
    cy.get("@conversation").then(() => {
      cy.get("header.tablet").should("be.visible");
      cy.get("header.mobile").should("not.be.visible");
      cy.get("header.tablet button").should("not.exist");
    });
  });

  it("Changes Between Tablet and Mobile Header When Viewport is Resized", () => {
    cy.viewport(768, 500);
    cy.get("@conversation").then(() => {
      cy.get("header.tablet").should("be.visible");
      cy.get("header.mobile").should("not.be.visible");
    });
    cy.viewport(320, 500);
    cy.get("@conversation").then(() => {
      cy.get("header.tablet").should("not.be.visible");
      cy.get("header.mobile").should("be.visible");
    });
  });
});
