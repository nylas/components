describe("$NAME$ component", () => {
  it("Renders", () => {
    cy.visit("/components/$NAME$/src/index.html");
    cy.get("nylas-$NAME$").should("exist");
  });
});
