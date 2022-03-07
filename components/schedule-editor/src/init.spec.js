let testScheduleEditor;

beforeEach(() => {
  cy.visit("/components/schedule-editor/src/index.html");
  cy.get("nylas-schedule-editor").should("exist");
  cy.get("nylas-schedule-editor").then((element) => {
    const component = element[0];
    component.setAttribute("id", "test-schedule-editor");
    testScheduleEditor = component;
  });
});

describe("schedule-editor component", () => {
  it("Renders", () => {
    cy.get(testScheduleEditor)
      .should("have.prop", "id")
      .and("equal", "test-schedule-editor");
  });

  describe("Allows for multiple meetings", () => {
    it("Allows the user to add consecutive meetings", () => {
      cy.get("button.add-event").click();
      cy.get(".basic-details fieldset").should("have.length", 3);
      cy.get("button.add-event").click();
      cy.get(".basic-details fieldset").should("have.length", 4);
      cy.get("button.remove-event").eq(0).click();
      cy.get("button.remove-event").eq(0).click();
      cy.get(".basic-details fieldset").should("have.length", 2);
    });
  });
});

describe("Editable Sections", () => {
  it("Expands the first section by default", () => {
    cy.get(testScheduleEditor)
      .get("nylas-schedule-editor-section")
      .should("have.length", 6);
    cy.get(testScheduleEditor).get("details[open]").should("have.length", 1);
    cy.get(testScheduleEditor).get("details").eq(0).should("have.attr", "open");
  });

  it("Allows a custom section to be expanded", () => {
    const sectionConfig = {
      "basic-details": {
        expanded: false,
        editable: true,
      },
      "time-date-details": {
        expanded: true,
        editable: true,
      },
      "style-details": {
        expanded: false,
        editable: true,
      },
      "booking-details": {
        expanded: true,
        editable: true,
      },
      "custom-fields": {
        expanded: false,
        editable: true,
      },
      "notification-details": {
        expanded: false,
        editable: true,
      },
    };

    cy.get(testScheduleEditor).then((element) => {
      const component = element[0];
      component.sections = sectionConfig;

      cy.get(testScheduleEditor).get("details[open]").should("have.length", 2);
      cy.get(testScheduleEditor)
        .get("details")
        .eq(0)
        .should("not.have.attr", "open");
      cy.get(testScheduleEditor)
        .get("details")
        .eq(1)
        .should("have.attr", "open");
      cy.get(testScheduleEditor)
        .get("details")
        .eq(3)
        .should("have.attr", "open");

      cy.get(testScheduleEditor)
        .get("nylas-schedule-editor-section:eq(1) h1")
        .click();
      cy.get(testScheduleEditor).get("details[open]").should("have.length", 1);
      cy.get(testScheduleEditor)
        .get("nylas-schedule-editor-section:eq(3) h1")
        .click();
      cy.get(testScheduleEditor).get("details[open]").should("have.length", 0);
      cy.get(testScheduleEditor)
        .get("nylas-schedule-editor-section:eq(5) h1")
        .click();
      cy.get(testScheduleEditor).get("details[open]").should("have.length", 1);
    });
  });

  it("Doesn't show sections not included in passed prop", () => {
    const sectionConfig = {
      "custom-fields": {
        expanded: true,
        editable: true,
      },
      "notification-details": {
        expanded: false,
        editable: true,
      },
    };

    cy.get(testScheduleEditor).then((element) => {
      const component = element[0];
      component.sections = sectionConfig;
      cy.get(testScheduleEditor)
        .get("nylas-schedule-editor-section")
        .should("have.length", 2);
    });
  });

  it("Is pretty chill about editable property not being there", () => {
    const sectionConfig = {
      "custom-fields": {
        expanded: true,
      },
      "notification-details": {
        expanded: false,
      },
    };

    cy.get(testScheduleEditor).then((element) => {
      const component = element[0];
      component.sections = sectionConfig;
      cy.get(testScheduleEditor)
        .get("nylas-schedule-editor-section")
        .should("have.length", 2);
    });
  });

  it("Allows specific fields to be hidden", () => {
    const sectionConfigWithHiddenFields = {
      "style-details": {
        expanded: true,
        editable: true,
        hidden_fields: ["show_ticks"],
      },
      "booking-details": {
        expanded: false,
        editable: true,
      },
    };

    cy.get(testScheduleEditor).then((element) => {
      const component = element[0];
      component.sections = sectionConfigWithHiddenFields;
      cy.get("nylas-schedule-editor-section")
        .eq(0)
        .shadow()
        .get(".contents")
        .children()
        .should("contain", "View as a Schedule");
      cy.get("nylas-schedule-editor-section")
        .eq(0)
        .shadow()
        .get(".contents")
        .children()
        .should("not.contain", "Show ticks");
    });
  });
});
