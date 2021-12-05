const AGENDA_EVENTS = [
  {
    title: "Some event that I am manipulating outside of the context of Nylas",
    description: "Passed in from HTML!",
    participants: [],
    when: {
      end_time: 1600444800,
      object: "timespan",
      start_time: 1600437600,
    },
  },
  {
    title: "Some I got from elsewhere",
    description: "Passed in from HTML!",
    participants: [],
    when: {
      end_time: 1600452000,
      object: "timespan",
      start_time: 1600448400,
    },
  },
];

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
          agenda.events = AGENDA_EVENTS;

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

describe("Timeboxing", () => {
  it("scales midnight to midnight by default", () => {
    cy.visit("/components/agenda/src/index.html");
    cy.get("nylas-agenda").should("exist");
    cy.get("nylas-agenda").then((element) => {
      const agenda = element[0];
      agenda.events = AGENDA_EVENTS;
      agenda.auto_time_box = false;
      // First tick is 12 AM regardless of auto_time_box;
      cy.get(".ticks").get(".tick:eq(0)").should("contain", "12 AM");
      // it gets its height offset into the negative if we're timeboxed. Test that.
      cy.get(".ticks").get(".tick:eq(0)").should("have.css", "top", "0px");
    });
  });
  it("correctly scales view to start and end when events do", () => {
    cy.visit("/components/agenda/src/index.html");
    cy.get("nylas-agenda").then((element) => {
      const agenda = element[0];
      agenda.events = AGENDA_EVENTS;
      agenda.auto_time_box = true;
      // first event starts at 10:00am; or 600 minutes into a 1440 minute day.
      // last event ends at 2:00pm, or 840 minutes into a 1440 minute day
      // so we're zooming to between 10a-2p, or 600-840, showing 240/1440 minutes.
      // Our active view therefore shows 4 hours, and are concealing 10 hours before;
      // 10/4 = 2.5.
      // We thus expect the "concealed before" viewport to be 250% of our active view,
      // in otherwords, a top of -250% (or, against our viewport, -1760px)
      cy.get(".ticks").get(".tick:eq(0)").should("have.css", "top", "-1760px");
    });
  });
  it("updates auto_time_box view when events are updated externally", () => {
    cy.visit("/components/agenda/src/index.html");
    cy.get("nylas-agenda").then((element) => {
      const agenda = element[0];
      agenda.events = AGENDA_EVENTS;
      agenda.auto_time_box = true;
      cy.get(".ticks")
        .get(".tick:eq(0)")
        .should("have.css", "top", "-1760px")
        .then(() => {
          agenda.events = [
            ...AGENDA_EVENTS.map((slot, i) => {
              if (i === 0) {
                slot.when.start_time = 1600444800; // 12:00
                slot.when.end_time = 1600446600; // 12:30
              }
              return slot;
            }),
          ];
          cy.get(".ticks")
            .get(".tick:eq(0)")
            .should("have.css", "top", "-4224px");
        });
    });
  });
});
