describe("scheduler component", () => {
  it("Renders", () => {
    cy.visit("/components/scheduler/src/index.html");
    cy.get("nylas-scheduler").should("exist");
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
      cy.get("nylas-availability").as("availability");
      cy.get("nylas-scheduler")
        .as("scheduler")
        .then((element) => {
          const component = element[0];
          component.slots_to_book = slots_to_book;
          cy.get("h3").contains("Meeting:");
        });
    });
    // TODO - Re-enable this once we have dedicated test components
    xit("inherits event title from editor-manifest", () => {
      cy.document().then(($document) => {
        $document.getElementsByTagName("nylas-scheduler")[0].remove();
        let newScheduler = $document.createElement("nylas-scheduler");
        newScheduler.id = "demo-scheduler";
        newScheduler.slots_to_book = slots_to_book;
        $document.body.getElementsByTagName("main")[0].append(newScheduler);
      });
      cy.get("h3").contains("My Wonderful Event:");
    });
    it("inherits event title from passed-property", () => {
      cy.document().then(($document) => {
        $document.getElementsByTagName("nylas-scheduler")[0].remove();
        let newScheduler = $document.createElement("nylas-scheduler");
        newScheduler.id = "demo-scheduler";
        newScheduler.editor_id = "demo-schedule-editor";
        newScheduler.event_title = "Test-Passed Title";
        newScheduler.slots_to_book = slots_to_book;
        $document.body.getElementsByTagName("main")[0].append(newScheduler);
      });
      cy.get("h3").contains("Test-Passed Title:");
    });
  });
});
