describe("availability component", () => {
  beforeEach(() => {
    cy.visit("/components/availability/src/index.html");
    cy.get("nylas-availability").should("exist");
  });

  describe("available times", () => {
    it("observes available times", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.available_times = [];
          cy.get(".slot.unavailable").should("not.exist");
        });

      const available_times = [
        {
          start_time: new Date(new Date().setHours(1, 0, 0, 0)),
          end_time: new Date(new Date().setHours(3, 0, 0, 0)),
        },
        {
          start_time: new Date(new Date().setHours(8, 0, 0, 0)),
          end_time: new Date(new Date().setHours(16, 0, 0, 0)),
        },
      ];

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.available_times = available_times;
          cy.get(".slot.unavailable").should("exist");
          cy.get(".slot.available").should("have.length", 40);
        });

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.slot_size = 30;
          cy.get(".slot.available").should("have.length", 20);
        });
    });
  });

  describe("unavailable times", () => {
    it("observes unavailable times", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.available_times = [];
          component.unavailable_times = [];
          cy.get(".slot.unavailable").should("not.exist");
        });

      const unavailable_times = [
        {
          start_time: new Date(new Date().setHours(1, 0, 0, 0)),
          end_time: new Date(new Date().setHours(3, 0, 0, 0)),
        },
        {
          start_time: new Date(new Date().setHours(8, 0, 0, 0)),
          end_time: new Date(new Date().setHours(16, 0, 0, 0)),
        },
      ];

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.unavailable_times = unavailable_times;
          cy.get(".slot.unavailable").should("exist");
          cy.get(".slot.available").should("have.length", 56);
        });

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.slot_size = 30;
          cy.get(".slot.available").should("have.length", 28);
        });
    });
  });

  describe("multiple availability sets", () => {
    it("observes multiple availabilites", () => {
      const available_times = [
        [
          {
            start_time: new Date(new Date().setHours(0, 0, 0, 0)),
            end_time: new Date(new Date().setHours(6, 0, 0, 0)),
          },
          {
            start_time: new Date(new Date().setHours(9, 0, 0, 0)),
            end_time: new Date(new Date().setHours(15, 0, 0, 0)),
          },
        ],
        [
          {
            start_time: new Date(new Date().setHours(4, 0, 0, 0)),
            end_time: new Date(new Date().setHours(11, 0, 0, 0)),
          },
        ],
        [
          {
            start_time: new Date(new Date().setHours(5, 0, 0, 0)),
            end_time: new Date(new Date().setHours(11, 0, 0, 0)),
          },
          {
            start_time: new Date(new Date().setHours(21, 0, 0, 0)),
            end_time: new Date(new Date().setHours(23, 0, 0, 0)),
          },
        ],
      ];

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.available_times = available_times;
          cy.get(".slot.partial").should("exist");
          cy.get(".slot.partial").should("have.length", 56);
        });
    });
  });

  describe("start and ending hour props", () => {
    it("Shows timeslots from 12AM to the next day's 12AM by default", () => {
      const today = new Date();
      today.setHours(0, 0, 0);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0);
      tomorrow.setDate(today.getDate() + 1);
      cy.get(".slot")
        .first()
        .invoke("attr", "data-start-time")
        .should("eq", today.toLocaleString());
      cy.get(".slot")
        .last()
        .invoke("attr", "data-end-time")
        .should("eq", tomorrow.toLocaleString());
    });

    it("Updates start_hour via component prop", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.start_hour = 8;
          const start_time = new Date();
          start_time.setHours(component.start_hour, 0, 0);
          cy.get(".slot").should("have.length", 64);
          cy.get(".slot")
            .first()
            .invoke("attr", "data-start-time")
            .should("eq", start_time.toLocaleString());
        });
    });

    it("Updates end_hour via component prop", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.end_hour = 8;
          const end_time = new Date();
          end_time.setHours(component.end_hour, 0, 0);
          cy.get(".slot").should("have.length", 32);
          cy.get(".slot")
            .last()
            .invoke("attr", "data-end-time")
            .should("eq", end_time.toLocaleString());
        });
    });
  });

  describe("slot_size prop", () => {
    it("Shows 15 minute time slots as default", () => {
      cy.get(".slot").should("have.length", 96);
    });

    it("Updates slot_size via component prop", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.slot_size = 60;
          cy.get(".slot").should("have.length", 24);
        });
    });
  });

  describe("start_date prop", () => {
    it("Uses today's date as start_date by default", () => {
      cy.get("div.day")
        .first()
        .get("header h2")
        .contains(new Date().toLocaleDateString());
    });

    it("Updates start_date via component prop", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          component.start_date = nextWeek;
          cy.get("div.day")
            .first()
            .get("header h2")
            .contains(nextWeek.toLocaleDateString());
        });
    });
  });

  describe("dates_to_show prop", () => {
    it("Shows one day by default", () => {
      cy.get("div.day").should("have.length", 1);
    });

    it("Updates dates_to_show via component prop", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.dates_to_show = 7;
          cy.get("div.day").should("have.length", 7);
        });
    });
  });

  describe("click_action prop", () => {
    it('Handles click_action="choose"', () => {
      cy.get(".slot").first().should("have.class", "unselected");
      cy.get(".slot").first().click();
      cy.get(".slot").first().should("have.class", "selected");
      cy.get("footer.confirmation").should("not.exist");
    });

    it('Handles click_action="verify"', () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.click_action = "verify";
          cy.get("footer.confirmation").should("exist");
          cy.get(".slot").first().should("have.class", "unselected");
          cy.get(".confirm-btn").should("be.disabled");
          cy.get(".slot").first().click();
          cy.get(".slot").first().should("have.class", "selected");
          cy.get(".confirm-btn").should("not.be.disabled");

          cy.get(".confirm-btn").click();
          cy.get(".slot").last().click();
          cy.get(".slot").first().should("have.class", "unselected");
        });
    });
  });

  describe("axis ticks", () => {
    it("shows ticks by default", () => {
      cy.get("ul.ticks").should("exist");
    });

    it("allows you to disable ticks column", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.show_ticks = false;
          cy.get("ul.ticks").should("not.exist");
        });
    });

    it("dynamically skips ticks depending on screen size and number of slots", () => {
      cy.viewport(550, 1500);
      cy.get("li.tick").should("have.length", 24);
      cy.viewport(550, 750);
      cy.get("li.tick").should("have.length", 8);
      cy.viewport(550, 150);
      cy.get("li.tick").should("have.length", 4);
      cy.viewport(550, 2500);
      cy.get("li.tick").should("have.length", 48);
      cy.viewport(550, 4000);
      cy.get("li.tick").should("have.length", 96);

      cy.get("nylas-availability").invoke("attr", "slot_size", 60);
      cy.get("li.tick").should("have.length", 24);

      cy.get("nylas-availability").invoke("attr", "slot_size", 30);
      cy.get("li.tick").should("have.length", 48);

      cy.get("nylas-availability").invoke("attr", "slot_size", 15);
      cy.get("nylas-availability").invoke("attr", "end_hour", 8);

      cy.viewport(550, 1500);
      cy.get("li.tick").should("have.length", 32);
    });
  });
});
