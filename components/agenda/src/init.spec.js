const AGENDA_EVENTS = [
  {
    title: "Static Event 1",
    description: "This event was passed in manually via events prop",
    participants: [],
    when: {
      end_time: 1600444800, // 12 PM
      object: "timespan",
      start_time: 1600437600, // 10 AM
    },
  },
  {
    title: "Static Event 2",
    description: "This event was passed in manually via events prop",
    participants: [],
    when: {
      end_time: 1600452000, // 2 PM
      object: "timespan",
      start_time: 1600448400, // 1 PM
    },
  },
];

describe("Agenda minimal display", () => {
  beforeEach(() => {
    cy.clock(1642179039224);

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "agenda/manifest.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/calendars/test-calendar-id",
      {
        fixture: "agenda/calendars/calendarId.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/agenda/events?calendar_id=test-calendar-id*",
      {
        fixture: "agenda/events.json",
      },
    );

    cy.visit("/components/agenda/src/cypress.html");
    cy.get("nylas-agenda").should("exist").as("agenda");
  });

  it("displays month and year", () => {
    cy.get("@agenda").invoke("attr", "header_type", "full");
    cy.get("@agenda").contains("January 2022");
  });

  it("displays current day and date", () => {
    cy.get("@agenda").invoke("attr", "header_type", "full");
    cy.get("@agenda").contains("Friday 14");
  });

  it("displays 4 fetched events", () => {
    cy.get("@agenda").contains("Sample Meeting 1");
    cy.get("@agenda").contains("Sample Meeting 2");
    cy.get("@agenda").contains("Sample Meeting 3");
    cy.get("@agenda").contains("Sample Meeting 4");
  });

  it("displays fetched events with conference meeting details", () => {
    cy.get("@agenda").contains(".event", "Sample Meeting 2");
    cy.get("@agenda").contains(".event", "This is a fake zoom meeting 2");
    cy.get("@agenda").contains(".event", "Link: fake.zoom.us");
  });

  it("displays date change buttons by default", () => {
    cy.get("@agenda").get("button.prev").should("be.visible");
    cy.get("@agenda").get("button.next").should("be.visible");
  });
});

describe("Agenda props", () => {
  beforeEach(() => {
    cy.clock(1642179039224);

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "agenda/manifest.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/calendars/test-calendar-id",
      {
        fixture: "agenda/calendars/calendarId.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/agenda/events?calendar_id=test-calendar-id*",
      {
        fixture: "agenda/events.json",
      },
    );

    cy.visit("/components/agenda/src/cypress.html");
    cy.get("nylas-agenda").should("exist").as("agenda");
  });

  it("displays date change buttons with allow_date_change prop", () => {
    cy.get("@agenda").invoke("attr", "allow_date_change", true);
    cy.get("@agenda").get("button.prev").should("be.visible");
    cy.get("@agenda").get("button.next").should("be.visible");
  });

  it("does not display date change buttons without allow_date_change prop", () => {
    cy.get("@agenda").invoke("attr", "allow_date_change", false);
    cy.get("@agenda").get("button.prev").should("not.exist");
    cy.get("@agenda").get("button.next").should("not.exist");
  });

  it("only allows navigation to dates in allowed_dates prop - allowed_dates as array of Date", () => {
    cy.get("@agenda").invoke("attr", "allow_date_change", true);
    cy.get("@agenda").invoke("attr", "selected_date", "");
    cy.get("@agenda").invoke("attr", "allowed_dates", [
      new Date("January 14 2022"),
      new Date("January 29 2022"),
    ]);

    cy.get("@agenda").contains("Friday 14");
    cy.get("button.prev").should("have.attr", "disabled");
    cy.get("button.next").click();
    cy.get("@agenda").contains("Saturday 29");
    cy.get("button.next").should("have.attr", "disabled");
  });

  it("only allows navigation to dates in allowed_dates prop - allowed_dates as comma separated string", () => {
    cy.get("@agenda").invoke("attr", "allow_date_change", true);
    cy.get("@agenda").invoke("attr", "selected_date", "");
    cy.get("@agenda").invoke(
      "attr",
      "allowed_dates",
      "January 14 2022, January 29 2022",
    );

    cy.get("@agenda").contains("Friday 14");
    cy.get("button.prev").should("have.attr", "disabled");
    cy.get("button.next").click();
    cy.get("@agenda").contains("Saturday 29");
    cy.get("button.next").should("have.attr", "disabled");
  });

  it("handles static events in events prop", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = AGENDA_EVENTS;
    });

    cy.get("@agenda").contains("Static Event 1");
    cy.get("@agenda").contains(
      "This event was passed in manually via events prop",
    );
  });

  it("passing static events overrides fetched events from calendar ids", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = AGENDA_EVENTS;
    });

    cy.get("@agenda").contains("Static Event 1");
    cy.get("@agenda").contains(
      "This event was passed in manually via events prop",
    );
    cy.get("@agenda").contains("Sample Meeting 1").should("not.exist");
    cy.get("@agenda").contains("Sample Meeting 2").should("not.exist");
    cy.get("@agenda").contains("Sample Meeting 3").should("not.exist");
    cy.get("@agenda").contains("Sample Meeting 4").should("not.exist");
  });

  it("removing static events fetches events by calendar ids", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = AGENDA_EVENTS;
    });

    cy.get("@agenda").contains("Static Event 1");
    cy.get("@agenda").contains(
      "This event was passed in manually via events prop",
    );

    cy.get("@agenda").contains("Sample Meeting 1").should("not.exist");

    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = null;
    });

    cy.get("@agenda").contains("Static Event 1").should("not.exist");
    cy.get("@agenda").contains("Sample Meeting 1");
    cy.get("@agenda").contains("Sample Meeting 2");
    cy.get("@agenda").contains("Sample Meeting 3");
    cy.get("@agenda").contains("Sample Meeting 4");
  });

  it("24 hour timeline is visible when auto_time_box is false", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.auto_time_box = false;
    });

    [
      "12 AM",
      "1 AM",
      "2 AM",
      "3 AM",
      "4 AM",
      "5 AM",
      "6 AM",
      "7 AM",
      "8 AM",
      "9 AM",
      "10 AM",
      "11 AM",
      "12 PM",
      "1 PM",
      "2 PM",
      "3 PM",
      "4 PM",
      "5 PM",
      "6 PM",
      "7 PM",
      "8 PM",
      "9 PM",
      "10 PM",
      "11 PM",
    ].forEach((time) => cy.get("@agenda").contains(time).should("be.visible"));
  });

  it("shows compacted timeline from first event to last event when auto_time_box is true", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.auto_time_box = true;
    });

    ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"].forEach(
      (time) => cy.get("@agenda").contains(time).should("be.visible"),
    );

    ["9 AM", "6 PM"].forEach((time) =>
      cy.get("@agenda").contains(time).should("not.be.visible"),
    );
  });

  it("compacted timeline adjust when events prop is updated", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.auto_time_box = true;
    });

    ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"].forEach(
      (time) => cy.get("@agenda").contains(time).should("be.visible"),
    );

    ["9 AM", "6 PM"].forEach((time) =>
      cy.get("@agenda").contains(time).should("not.be.visible"),
    );

    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = AGENDA_EVENTS;
    });

    ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM"].forEach((time) =>
      cy.get("@agenda").contains(time).should("be.visible"),
    );

    ["9 AM", "3 PM", "4 PM", "5 PM", "6 PM"].forEach((time) =>
      cy.get("@agenda").contains(time).should("not.be.visible"),
    );
  });
});

describe("Agenda interactions", () => {
  beforeEach(() => {
    cy.clock(1642179039224);

    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/manifest",
      {
        fixture: "agenda/manifest.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/calendars/test-calendar-id",
      {
        fixture: "agenda/calendars/calendarId.json",
      },
    );
    cy.intercept(
      "GET",
      "https://web-components.nylas.com/middleware/agenda/events?calendar_id=test-calendar-id*",
      {
        fixture: "agenda/events.json",
      },
    );

    cy.visit("/components/agenda/src/cypress.html");
    cy.get("nylas-agenda").should("exist").as("agenda");
  });

  it("changes date to tomorrow", () => {
    cy.get("@agenda").invoke("attr", "allow_date_change", true);
    cy.get("@agenda").contains("Friday 14");
    cy.get("button.next").click();
    cy.get("@agenda").contains("Saturday 15");
  });

  it("changes date to yesterday", () => {
    cy.get("@agenda").invoke("attr", "allow_date_change", true);
    cy.get("@agenda").contains("Friday 14");
    cy.get("button.prev").click();
    cy.get("@agenda").contains("Thursday 13");
  });
});
