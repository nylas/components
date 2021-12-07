let schedulerTestComponent;
let availabilityTestComponent;

beforeEach(() => {
  cy.visit("/components/scheduler/src/index.html");

  // scheduler component
  cy.get("nylas-scheduler").should("exist");
  cy.get("nylas-scheduler").then((element) => {
    const component = element[0];
    component.setAttribute("id", "test-scheduler");
    schedulerTestComponent = component;
  });

  // availability component
  cy.get("nylas-availability").should("exist");
  cy.get("nylas-availability").then((element) => {
    const component = element[0];
    component.setAttribute("id", "test-availability");
    availabilityTestComponent = component;
  });
});

describe("scheduler component", () => {
  it("Renders test component", () => {
    cy.get(schedulerTestComponent)
      .should("have.prop", "id")
      .and("equal", "test-scheduler");
    cy.get(availabilityTestComponent)
      .should("have.prop", "id")
      .and("equal", "test-availability");
  });

  const slots_to_book = [
    {
      selectionStatus: "selected",
      calendar_id: "abc123",
      availability: "free",
      available_calendars: ["thelonious@nylas.com"],
      start_time: new Date(new Date().setHours(1, 0, 0, 0)),
      end_time: new Date(new Date().setHours(3, 0, 0, 0)),
    },
  ];

  describe("Inherits and passes properties", () => {
    it("has a default event title", () => {
      schedulerTestComponent.slots_to_book = slots_to_book;
      cy.get(schedulerTestComponent).find("h3").contains("Meeting:");
    });
    // TODO - Re-enable this once we have dedicated test components
    xit("inherits event title from editor-manifest", () => {
      cy.document().then(($document) => {
        $document.getElementsByTagName("nylas-scheduler")[0].remove();
        let newScheduler = $document.createElement("nylas-scheduler");
        newScheduler.setAttribute("id", "test-scheduler");
        newScheduler.slots_to_book = slots_to_book;
        $document.body.getElementsByTagName("main")[0].append(newScheduler);
      });
      cy.get("h3").contains("My Wonderful Event:");
    });
    it("inherits event title from passed-property", () => {
      cy.document().then(($document) => {
        $document.getElementsByTagName("nylas-scheduler")[0].remove();
        let newScheduler = $document.createElement("nylas-scheduler");
        newScheduler.setAttribute("id", "test-scheduler");
        newScheduler.editor_id = "test-schedule-editor";
        newScheduler.event_title = "Test-Passed Title";
        newScheduler.slots_to_book = slots_to_book;
        $document.body.getElementsByTagName("main")[0].append(newScheduler);
      });
      cy.get("h3").contains("Test-Passed Title:");
    });
  });

  describe("Custom Fields", () => {
    it("only shows custom fields when timeslots are selected", () => {
      cy.get(schedulerTestComponent).then((element) => {
        element[0].slots_to_book = [];
        cy.get("#custom-fields").should("not.exist");
      });
    });

    it("shows a single email address field by default", () => {
      cy.get(schedulerTestComponent).then((element) => {
        element[0].slots_to_book = slots_to_book;
        cy.get("#custom-fields").should("exist");
        cy.get("#custom-fields strong").should("have.length", 2);
        cy.get("#custom-fields strong").contains("Email Address");
        cy.get("#custom-fields strong").contains("Your Name");
      });
    });

    it("doesnt let you submit form with required fields unfulfilled", () => {
      cy.get(schedulerTestComponent).then((element) => {
        const component = element[0];
        component.slots_to_book = slots_to_book;
        cy.get("button.book").should("exist");
        cy.get("button.book").should("have.attr", "disabled");
        cy.get("#custom-fields label:eq(0) input").type("foo");
        cy.get("button.book").should("have.attr", "disabled");
      });
    });

    it("lets you submit once required fields are filled out", () => {
      cy.get(schedulerTestComponent).then((element) => {
        const component = element[0];
        component.slots_to_book = slots_to_book;
        cy.get("button.book").should("exist");
        cy.get("button.book").should("have.attr", "disabled");
        cy.get("#custom-fields label:eq(1) input").type("bar");
        cy.get("button.book").should("not.have.attr", "disabled");
      });
    });
  });
});
