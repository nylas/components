describe("scheduler component", () => {
  it("Renders", () => {
    cy.visit("/components/scheduler/src/index.html");
    cy.get("nylas-scheduler").should("exist");
  });
});
