describe("schedule-editor component", () => {
  it("Renders", () => {
    cy.visit("/components/schedule-editor/src/index.html");
    cy.get("nylas-schedule-editor").should("exist");
  });
});
