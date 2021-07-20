describe("Restricting Dates", () => {
  it("handles allowed_dates as an array of dates ", () => {
    cy.visit("/components/agenda/src/index.html");
    cy.get("nylas-agenda").should("exist");
    cy.get("nylas-agenda").shadow().find("h2").should("exist");
    cy.get("nylas-agenda").invoke("attr", "header_type", "full");
    cy.get("nylas-agenda").invoke("attr", "allow_date_change", true);
    cy.get("nylas-agenda").invoke("attr", "selected_date", "");
    cy.get("nylas-agenda").invoke("attr", "allowed_dates", [
      new Date("March 24 2021"),
      new Date("March 29 2021"),
      new Date("March 30 2021"),
    ]);

    cy.get("nylas-agenda").shadow().find("h2").should("exist");
    cy.get("nylas-agenda").shadow().find("h2").should("contain", "Wednesday");
    cy.get("nylas-agenda").shadow().find("h2").should("contain", "24");
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(0)
      .should("have.attr", "disabled");
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(1)
      .should("not.have.attr", "disabled");
    cy.get("nylas-agenda").shadow().find(".day > button").eq(1).click();
    cy.get("nylas-agenda").shadow().find("h2").should("contain", "Monday");
    cy.get("nylas-agenda").shadow().find("h2").should("contain", "29");
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(0)
      .should("not.have.attr", "disabled");
    cy.get("nylas-agenda").shadow().find(".day > button").eq(1).click();
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(1)
      .should("have.attr", "disabled");
  });

  it("handles allowed_dates as a comma-separated string ", () => {
    cy.visit("/components/agenda/src/index.html");
    cy.get("nylas-agenda").should("exist");
    cy.get("nylas-agenda").shadow().find("h2").should("exist");
    cy.get("nylas-agenda").invoke("attr", "header_type", "full");
    cy.get("nylas-agenda").invoke("attr", "allow_date_change", true);
    cy.get("nylas-agenda").invoke("attr", "selected_date", "");
    cy.get("nylas-agenda").invoke(
      "attr",
      "allowed_dates",
      "March 22 2021, March 28 2021",
    );

    cy.get("nylas-agenda").shadow().find("h2").should("exist");
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(0)
      .should("have.attr", "disabled");
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(1)
      .should("not.have.attr", "disabled");
    cy.get("nylas-agenda").shadow().find(".day > button").eq(1).click();
    cy.get("nylas-agenda").shadow().find("h2").should("contain", "Sunday");
    cy.get("nylas-agenda").shadow().find("h2").should("contain", "28");
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(0)
      .should("not.have.attr", "disabled");
    cy.get("nylas-agenda")
      .shadow()
      .find(".day > button")
      .eq(1)
      .should("have.attr", "disabled");
  });
});
