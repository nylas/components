import "cypress-file-upload";

Cypress.Commands.add("loadContacts", () => {
  cy.server();
  cy.route({
    method: "get",
    url: "/middleware/contact-list/contacts?limit=10&offset=0",
  }).as("little-contacts");
  cy.route({
    method: "get",
    url: "/middleware/contact-list/contacts?limit=100&offset=0",
  }).as("contacts");
  cy.route({
    method: "get",
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
