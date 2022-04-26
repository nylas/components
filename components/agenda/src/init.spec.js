const BASE_PATH = Cypress.env("TEST_COVERAGE")
  ? "agenda/src/cypress.html"
  : "/components/agenda/src/index.html";

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

const MIXED_TYPE_EVENTS = [
  {
    status: "confirmed",
    title: "A limited-time event",
    when: {
      end_time: 1642179600, //12:00
      object: "timespan",
      start_time: 1642176900, //11:15
    },
  },
  {
    status: "confirmed",
    title: "An All Day Event",
    when: {
      date: "2022-01-14",
      object: "date",
    },
  },
  {
    status: "confirmed",
    title: "Test All Day Event Two",
    when: {
      date: "2022-01-14",
      object: "date",
    },
  },
];

const METADATA_EVENTS = [
  {
    status: "confirmed",
    title: "A metadata-laden event",
    metadata: {
      nananana: "nananana",
      bat: "man",
    },
    when: {
      end_time: 1642179600, //12:00
      object: "timespan",
      start_time: 1642176900, //11:15
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

    cy.visit(BASE_PATH);
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

    cy.visit(BASE_PATH);
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

    cy.batchIntercept("GET", {
      "**/middleware/manifest": "agenda/manifest",
      "**/middleware/calendars/test-calendar-id": "agenda/calendars/calendarId",
      "**/middleware/agenda/events?calendar_id=test-calendar-id*":
        "agenda/events",
    });

    cy.visit(BASE_PATH);
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

describe("Agenda Custom Data", () => {
  beforeEach(() => {
    cy.clock(1642179039224);

    cy.batchIntercept("GET", {
      "**/middleware/manifest": "agenda/manifest",
      "**/middleware/calendars/test-calendar-id": "agenda/calendars/calendarId",
      "**/middleware/agenda/events?calendar_id=test-calendar-id*":
        "agenda/events",
    });

    cy.visit(BASE_PATH);
    cy.get("nylas-agenda").should("exist").as("agenda");
    cy.get("@agenda").invoke("attr", "timezone", "America/Toronto");
  });
  it("shows all-day events when passed", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = MIXED_TYPE_EVENTS;
      agenda.auto_time_box = false;
      cy.get("@agenda").contains("An All Day Event").should("exist");
      cy.get("@agenda").contains("Test All Day Event Two").should("exist");
      cy.get("@agenda").contains("A limited-time event").should("exist");
    });
  });
});

describe("Agenda custom events", () => {
  beforeEach(() => {
    cy.clock(1642179039224);

    cy.batchIntercept("GET", {
      "**/middleware/manifest": "agenda/manifest",
      "**/middleware/calendars/test-calendar-id": "agenda/calendars/calendarId",
      "**/middleware/agenda/events?*": "agenda/events",
    });

    cy.visit(BASE_PATH);
    cy.get("nylas-agenda").should("exist").as("agenda");
  });

  it("dispatches dateChange when date goes forward", () => {
    const dateChangeStub = cy.stub().as("dateChange");
    cy.get("@agenda").addListener("dateChange", dateChangeStub);

    cy.get("@agenda")
      .find(".next.change-date")
      .click()
      .then(() => {
        const [event] = dateChangeStub.args[0];
        expect(event.detail).to.deep.equal(
          new Date("Sat, 15 Jan 2022 05:00:00 GMT"),
        );
      });
  });

  it("dispatches dateChange when date goes backward", () => {
    const dateChangeStub = cy.stub().as("dateChange");
    cy.get("@agenda").addListener("dateChange", dateChangeStub);

    cy.get("@agenda")
      .find(".prev.change-date")
      .click()
      .then(() => {
        const [event] = dateChangeStub.args[0];
        expect(event.detail).to.deep.equal(
          new Date("Thu, 13 Jan 2022 05:00:00 GMT"),
        );
      });
  });

  it("dispatches eventClicked when calendar event clicked", () => {
    const eventClickedStub = cy.stub().as("event");
    cy.get("@agenda").addListener("eventClicked", eventClickedStub);

    cy.get("@agenda").find("li.event").first().click();

    cy.fixture("agenda/events").then((events) => {
      const [event] = eventClickedStub.args[0];
      expect(event.detail).to.deep.include(events.response[0]);
    });
  });
});

describe("Display events in different timezone is specified", () => {
  beforeEach(() => {
    //Set current time to 2am
    cy.clock(1642143600000);
    cy.batchIntercept("GET", {
      "**/middleware/manifest": "agenda/manifest",
      "**/middleware/calendars/test-calendar-id": "agenda/calendars/calendarId",
      "**/middleware/agenda/events?*": "agenda/events",
    });

    cy.visit(BASE_PATH);
    cy.get("nylas-agenda").should("exist").as("agenda");
  });

  it("displays current day of week and date in cooresponding timezone", () => {
    cy.get("@agenda").invoke("attr", "timezone", "America/Toronto");
    cy.get("@agenda").contains("Friday 14");
    cy.get("@agenda").invoke("attr", "timezone", "America/Los_Angeles");
    cy.get("@agenda").contains("Thursday 13");
  });

  it("displays fetched events time with corresponding timezone", () => {
    cy.get("@agenda").invoke("attr", "timezone", "America/Toronto");
    cy.get("@agenda").get(".event").eq(0).contains(".time", "10:00 AM");
    cy.get("@agenda").get(".event").eq(1).contains(".time", "12:35 PM");
    cy.get("@agenda").invoke("attr", "timezone", "America/Los_Angeles");
    cy.get("@agenda").get(".event").eq(0).contains(".time", "7:00 AM");
    cy.get("@agenda").get(".event").eq(1).contains(".time", "9:35 AM");
  });
});

describe("Display event metadata", () => {
  beforeEach(() => {
    //Set current time to 2am
    cy.clock(1642143600000);
    cy.batchIntercept("GET", {
      "**/middleware/manifest": "agenda/manifest",
      "**/middleware/calendars/test-calendar-id": "agenda/calendars/calendarId",
      "**/middleware/agenda/events?*": "agenda/events",
    });

    cy.visit(BASE_PATH);
    cy.get("nylas-agenda").should("exist").as("agenda");
  });

  it("displays metadata on an event by default", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = METADATA_EVENTS;
      agenda.auto_time_box = false;
      cy.get("@agenda").contains("A metadata-laden event").should("exist");
      cy.get("@agenda")
        .contains("A metadata-laden event")
        .should("exist")
        .get("ul.metadata")
        .should("exist");
      cy.get("@agenda")
        .contains("A metadata-laden event")
        .should("exist")
        .get("ul.metadata li")
        .should("have.length", 2);
      cy.get("@agenda")
        .contains("A metadata-laden event")
        .should("exist")
        .get("ul.metadata")
        .should("contain", "bat: man");
    });
  });
  it("hides metadata when display_metadata is false", () => {
    cy.get("@agenda").then((element) => {
      const agenda = element[0];
      agenda.events = METADATA_EVENTS;
      agenda.auto_time_box = false;
      agenda.display_metadata = false;
      cy.get("@agenda").contains("A metadata-laden event").should("exist");
      cy.get("@agenda")
        .contains("A metadata-laden event")
        .get("ul.metadata")
        .should("not.exist");
      cy.get("@agenda")
        .contains("A metadata-laden event")
        .should("not.contain", "bat: man");
    });
  });
});
