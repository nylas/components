describe("scheduler component", () => {
  it("Renders", () => {
    cy.visit("/components/scheduler/src/index.html");
    cy.get("nylas-scheduler").should("exist");
  });

  // TODO: when we have slots_to_book from https://github.com/nylas/components/pull/59, add tests for cascading event.title inheritance
  // describe("Inherits and passes properties", () => {
  // })
});
