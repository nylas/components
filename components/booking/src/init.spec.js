const BASE_PATH = Cypress.env("TEST_COVERAGE")
  ? "booking/src/cypress.html"
  : "/components/booking/src/index.html";

let bookingTestComponent;
let availabilityTestComponent;
const frozenDateTime = () => new Date(2021, 11, 15, 9, 0, 0);
beforeEach(() => {
  cy.clock(frozenDateTime().getTime(), ["Date"]);
  cy.visit(BASE_PATH);

  // booking component
  cy.get("nylas-booking").should("exist");
  cy.get("nylas-booking").then((element) => {
    const component = element[0];
    component.setAttribute("id", "test-scheduler");
    bookingTestComponent = component;
  });

  // availability component
  cy.get("nylas-availability").should("exist");
  cy.get("nylas-availability").then((element) => {
    const component = element[0];
    component.setAttribute("id", "test-availability");
    availabilityTestComponent = component;
  });
});

describe("booking component", () => {
  it("Renders test component", () => {
    cy.get(bookingTestComponent)
      .should("have.prop", "id")
      .and("equal", "test-scheduler");
    cy.get(availabilityTestComponent)
      .should("have.prop", "id")
      .and("equal", "test-availability");
  });

  const basic_slots_to_book = [
    {
      selectionStatus: "selected",
      calendar_id: "abc123",
      availability: "free",
      available_calendars: ["thelonious@nylas.com"],
      start_time: new Date(frozenDateTime().setHours(1, 0, 0, 0)),
      end_time: new Date(frozenDateTime().setHours(3, 0, 0, 0)),
    },
  ];

  const hydrated_slots_to_book = [
    {
      selectionStatus: "selected",
      event_title: "My event-hydrated title",
      calendar_id: "abc123",
      availability: "free",
      available_calendars: ["thelonious@nylas.com"],
      start_time: new Date(frozenDateTime().setHours(1, 0, 0, 0)),
      end_time: new Date(frozenDateTime().setHours(3, 0, 0, 0)),
    },
  ];

  const consecutive_slots_to_book = [
    {
      selectionStatus: "selected",
      event_title: "My first meeting",
      calendar_id: "abc123",
      availability: "free",
      available_calendars: ["thelonious@nylas.com", "booker@nylas.com"],
      start_time: new Date(frozenDateTime().setHours(1, 0, 0, 0)),
      end_time: new Date(frozenDateTime().setHours(3, 0, 0, 0)),
    },
    {
      selectionStatus: "selected",
      event_title: "My second meeting",
      calendar_id: "abc123",
      availability: "free",
      available_calendars: ["miles@nylas.com"],
      start_time: new Date(frozenDateTime().setHours(3, 0, 0, 0)),
      end_time: new Date(frozenDateTime().setHours(5, 0, 0, 0)),
    },
  ];

  const CONSEC_OPTIONS = [
    [
      {
        emails: ["p1@nylas.com", "p2@nylas.com"],
        end_time: "2021-12-01T18:45:00.000Z",
        start_time: "2021-12-01T18:30:00.000Z",
        event_title: "My Intro Meeting",
        event_description: "My Intro description",
        slot_size: 15,
        participants: ["p1@nylas.com", "p2@nylas.com"],
      },
      {
        emails: ["hazik.a@nylas.com"],
        end_time: "2021-12-01T19:00:00.000Z",
        start_time: "2021-12-01T18:45:00.000Z",
        event_title: "My Closing Meeting",
        event_description: "My Closing description",
        slot_size: 15,
        participants: ["p3@nylas.com"],
      },
    ],
  ];

  const CONSECUTIVE_START_DATE = new Date(
    frozenDateTime().setDate(frozenDateTime().getDate() + 7),
  );
  const TWO = Math.round(
    new Date(CONSECUTIVE_START_DATE).setHours(14, 0, 0) / 1000,
  );
  const TWO_FIFTEEN = Math.round(
    new Date(CONSECUTIVE_START_DATE).setHours(14, 15, 0) / 1000,
  );
  const TWO_THIRTY = Math.round(
    new Date(CONSECUTIVE_START_DATE).setHours(14, 30, 0) / 1000,
  );
  const TWO_FORTY_FIVE = Math.round(
    new Date(CONSECUTIVE_START_DATE).setHours(14, 45, 0) / 1000,
  );
  const COMPONENT_RESPONSE = {
    component: {
      theming: {
        contacts_to_load: 100,
        show_filter: true,
        theme: "theme-1",
        sort_by: "name",
        click_action: "select",
        show_names: true,
      },
    },
  };

  const CONSEC_RESPONSE = [
    [
      {
        emails: ["nylascypresstest@gmail.com"],
        end_time: TWO_FIFTEEN,
        start_time: TWO,
      },
      {
        emails: ["arjun.k@nylas.com"],
        end_time: TWO_THIRTY,
        start_time: TWO_FIFTEEN,
      },
    ],
    [
      {
        emails: ["arjun.k@nylas.com"],
        end_time: TWO_FIFTEEN,
        start_time: TWO,
      },
      {
        emails: ["nylascypresstest@gmail.com"],
        end_time: TWO_THIRTY,
        start_time: TWO_FIFTEEN,
      },
    ],
    [
      {
        emails: ["arjun.k@nylas.com"],
        end_time: TWO_THIRTY,
        start_time: TWO_FIFTEEN,
      },
      {
        emails: ["nylascypresstest@gmail.com"],
        end_time: TWO_FORTY_FIVE,
        start_time: TWO_THIRTY,
      },
    ],
  ];

  describe("Consecutive Availability", () => {
    beforeEach(() => {
      cy.visit(BASE_PATH);
      cy.get('input[name="demo-type"]').check("consecutive");
    });

    xit("shows selectable consecutive options on load", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.show_weekends = false;
          component.start_date = CONSECUTIVE_START_DATE;
        });
      cy.get("nylas-booking")
        .as("booking")
        .then(() => {
          cy.get("h2").should("contain", "Select an option");
        });
    });

    xit("is loosey-goosey with event ordering", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.show_weekends = false;
          component.start_date = CONSECUTIVE_START_DATE;
        });
      cy.get("nylas-booking")
        .as("booking")
        .then(() => {
          // First event shows A then B
          cy.get("ul.timeslots li:eq(1)")
            .find(".sub-event:eq(0) h4")
            .should("contain", "My Intro Meeting:");
          cy.get("ul.timeslots li:eq(1)")
            .find(".sub-event:eq(1) h4")
            .should("contain", "My Follow-up Meeting:");

          // Second event shows B then A (participant A is busy at 9:00am)
          cy.get("ul.timeslots li:eq(0)")
            .find(".sub-event:eq(0) h4")
            .should("contain", "My Follow-up Meeting:");
          cy.get("ul.timeslots li:eq(0)")
            .find(".sub-event:eq(0) h4")
            .should("contain", "My Intro Meeting:");
        });
    });
  });

  describe("Choosing a slot from consecutive event list", () => {
    xit("selects a timeslot on availability when a booking item is clicked", () => {
      cy.intercept(
        "POST",
        "/middleware/calendars/availability/consecutive",
        (req) =>
          req.reply({ ...COMPONENT_RESPONSE, response: CONSEC_RESPONSE }),
      );
      cy.visit(BASE_PATH);
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.show_weekends = false;
          component.start_date = CONSECUTIVE_START_DATE;

          cy.get(".controls")
            .get('input[type="radio"][name="demo-type"][value="consecutive"]')
            .first()
            .check();

          cy.get("nylas-booking")
            .as("booking")
            .then(() => {
              cy.get("ul.timeslots li").should("have.length", 2);
              cy.get("ul.timeslots li:eq(0)").click();
              cy.get(".timeslot-options").should("not.exist");
              cy.get(".booker ul.timeslots li").should("have.length", 2);

              cy.get("nylas-availability")
                .as("availability")
                .then(() => {
                  // cy.get(".slot.free").should("have.length", 3);
                  // cy.get(".slot.busy").should("have.length", 157);
                  cy.get(".slot.selected").should("have.length", 2);
                });
            });
        });
    });
    // TODO: test time/reorder deduplication (same time, different ordering)
    // TODO: test slot-click, emitted-event
    // TODO: test slot de-select, booking back to options list
  });

  describe("Inherits and passes properties", () => {
    it("has a default event title", () => {
      bookingTestComponent.slots_to_book = basic_slots_to_book;
      cy.get(bookingTestComponent).find("h3").contains("Meeting:");
    });
    // TODO - Re-enable this once we have dedicated test components
    xit("inherits event title from editor-manifest", () => {
      cy.document().then(($document) => {
        $document.getElementsByTagName("nylas-booking")[0].remove();
        const newBooker = $document.createElement("nylas-booking");
        newBooker.setAttribute("id", "test-scheduler");
        newBooker.slots_to_book = basic_slots_to_book;
        $document.body.getElementsByTagName("main")[0].append(newBooker);
      });
      cy.get("h3").contains("My Wonderful Event:");
    });
    it("inherits event title from passed-property if no event title", () => {
      cy.document().then(($document) => {
        $document.getElementsByTagName("nylas-booking")[0].remove();
        const newBooker = $document.createElement("nylas-booking");
        newBooker.setAttribute("id", "test-scheduler");
        newBooker.editor_id = "test-schedule-editor";
        newBooker.event_title = "Test-Passed Title";
        newBooker.slots_to_book = basic_slots_to_book;
        $document.body.getElementsByTagName("main")[0].append(newBooker);
      });
      cy.get("h3").contains("Test-Passed Title:");
    });
    it("inherits event title events array's object title", () => {
      cy.document().then(($document) => {
        $document.getElementsByTagName("nylas-booking")[0].remove();
        const newBooker = $document.createElement("nylas-booking");
        newBooker.id = "demo-scheduler";
        newBooker.editor_id = "demo-schedule-editor";
        newBooker.event_title = "Test-Passed Title";
        newBooker.slots_to_book = hydrated_slots_to_book;
        $document.body.getElementsByTagName("main")[0].append(newBooker);
      });
      cy.get("h3").contains("My event-hydrated title");
    });
  });

  describe("Custom Fields", () => {
    it("only shows custom fields when timeslots are selected", () => {
      cy.get(bookingTestComponent).then((element) => {
        element[0].slots_to_book = [];
        cy.get("#custom-fields").should("not.exist");
      });
    });

    it("shows a single email address field by default", () => {
      cy.get(bookingTestComponent).then((element) => {
        element[0].slots_to_book = basic_slots_to_book;
        cy.get("#custom-fields").should("exist");
        cy.get("#custom-fields strong").should("have.length", 2);
        cy.get("#custom-fields strong").contains("Email Address");
        cy.get("#custom-fields strong").contains("Your Name");
      });
    });

    it("doesnt let you submit form with required fields unfulfilled", () => {
      cy.get(bookingTestComponent).then((element) => {
        const component = element[0];
        component.slots_to_book = basic_slots_to_book;
        cy.get("button.book").should("exist");
        cy.get("button.book").should("have.attr", "disabled");
        cy.get("#custom-fields label:eq(0) input").type("foo");
        cy.get("button.book").should("have.attr", "disabled");
      });
    });

    it("lets you submit once required fields are filled out", () => {
      cy.get(bookingTestComponent).then((element) => {
        const component = element[0];
        component.slots_to_book = basic_slots_to_book;
        cy.get("button.book").should("exist");
        cy.get("button.book").should("have.attr", "disabled");
        cy.get("#custom-fields label:eq(1) input").type("bar");
        cy.get("button.book").should("not.have.attr", "disabled");
      });
    });
  });
});
