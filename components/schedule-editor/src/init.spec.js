describe("schedule-editor component", () => {
  it("Renders", () => {
    cy.visit("/components/schedule-editor/src/index.html");
    cy.get("nylas-schedule-editor").should("exist");
  });

  describe("Allows for multiple meetings", () => {
    it("Allows the user to add consecutive meetings", () => {
      cy.get(".basic-details fieldset").should("have.length", 1);
      cy.get(".basic-details button.add-event").click();
      cy.get(".basic-details fieldset").should("have.length", 2);
      cy.get(".basic-details button.add-event").click();
      cy.get(".basic-details fieldset").should("have.length", 3);
<<<<<<< HEAD
      cy.get(".basic-details button.remove-event").eq(0).click();
      cy.get(".basic-details button.remove-event").eq(0).click();
      cy.get(".basic-details fieldset").should("have.length", 1);
=======
>>>>>>> 464f387 (Multiple events)
    });
  });
});
