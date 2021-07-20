describe("Conversation component (Svelte)", () => {
  it("Shows Conversation", () => {
    cy.visit("/components/conversation/src/index.html");
    cy.get("nylas-conversation").should("exist");
  });
});
