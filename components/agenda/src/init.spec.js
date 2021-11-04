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

describe("Custom data", () => {
  it("Toggles between custom and Nylas data", () => {
    cy.visit("/components/agenda/src/index.html");
    cy.get("nylas-agenda").should("exist");
    cy.get("nylas-agenda").then((element) => {
      const agenda = element[0];

      // Check to make sure it's using Nylas data (My Wonderful Event is a signifier)
      cy.get("ul.events")
        .find("li.event h2:contains('My Wonderful Event')")
        .should("exist")
        .then(() => {
          // Set custom data
          agenda.events = [
            {
              title:
                "Some event that I am manipulating outside of the context of Nylas",
              description: "Passed in from HTML!",
              participants: [],
              when: {
                end_time: 1600444800,
                object: "timespan",
                start_time: 1600438500,
              },
            },
            {
              title: "Some I got from elsewhere",
              description: "Passed in from HTML!",
              participants: [],
              when: {
                end_time: 1600449999,
                object: "timespan",
                start_time: 1600448500,
              },
            },
          ];

          // Check to make sure it's using custom data (not Nylas data)
          cy.get("ul.events")
            .find("li.event h2")
            .should("not.contain", "My Wonderful Event");
          cy.get("ul.events")
            .find("li.event h2:contains('Some I got from elsewhere')")
            .should("exist")
            .then(() => {
              // Revert custom data
              agenda.events = null;

              // Check to make sure it's using Nylas data again
              cy.get("ul.events")
                .find("li.event h2")
                .should("contain", "My Wonderful Event");
              cy.get("ul.events")
                .find("li.event h2")
                .should("not.contain", "Some I got from elsewhere");
            });
        });
    });
  });
});
