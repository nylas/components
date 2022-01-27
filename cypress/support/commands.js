import "@testing-library/cypress/add-commands";
import "cypress-file-upload";

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
      return cy.get(componentName).then(($element) => {
        const newID = componentID.replace("demo", "test");
        $element.attr("id", newID);
        cy.get(`${componentName}#${newID}`).as("testComponent");
      });
    });
  },
);

/**
 * Define the fetch request `method` in the first parameter.
 * The second parameter is a set of key:value pairs where the
 * KEY is the url path to be intercepted and the VALUE is the
 * path of the fixture for the response.
 */
Cypress.Commands.add("batchIntercept", (method, fixtures) => {
  Object.entries(fixtures).forEach(([url, fixture]) => {
    cy.intercept(method, url, { fixture }).as(fixture);
  });
});
