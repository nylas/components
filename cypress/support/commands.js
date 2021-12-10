import "@testing-library/cypress/add-commands";
import "cypress-file-upload";

Cypress.Commands.add("loadContacts", () => {
  cy.server();
  cy.intercept({
    method: "GET",
    url: "/middleware/contact-list/contacts?limit=10&offset=0",
  }).as("little-contacts");
  cy.intercept({
    method: "GET",
    url: "/middleware/contact-list/contacts?limit=100&offset=0",
  }).as("contacts");
  cy.intercept({
    method: "GET",
    url: "/middleware/contact-list/contacts?limit=100&offset=100",
  }).as("one-hundred-more-contacts");
});

Cypress.Commands.add("visitMailbox", () => {
  cy.server();
  cy.fixture("threadsMock").then((response) => {
    cy.route({
      method: "get",
      url: "/middleware/threads?view=expanded",
      response: {
        component: { theming: {} },
        response,
      },
    }).as("threads");

    cy.visit("/components/mailbox/src/index.html");
    cy.get("nylas-mailbox").should("exist");
  });
});

Cypress.Commands.add(
  "visitComponentPage",
  (url, componentName, componentID) => {
    return cy.visit(url).then(() => {
      const newID = componentID.replace("demo", "test");
      cy.get(`${componentName}#${newID}`).as("testComponent");
    });
  },
);
