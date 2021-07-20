xdescribe("Day component", () => {
  xit("Time is a flat circle", () => {
    // todo: no id
    cy.visit("/components/day/src/index.html");
    cy.get("nylas-day").should("exist");
  });
});
