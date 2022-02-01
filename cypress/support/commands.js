import "@testing-library/cypress/add-commands";
import "cypress-file-upload";

Cypress.Commands.add("addComponent", (componentName, props) => {
  cy.document().then(($document) => {
    const component = $document.createElement(componentName);
    component.setAttribute("id", `test-${componentName.replace("nylas-", "")}`);

    Object.entries(props).forEach(([key, value]) => {
      component[key] = value;
    });

    cy.get("body").then(($body) => {
      $body.append(component);
    });
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

Cypress.Commands.add(
  "addListener",
  { prevSubject: "element" },
  ($element, eventName, callbackFn) => {
    $element[0].addEventListener(eventName, callbackFn);
  },
);
