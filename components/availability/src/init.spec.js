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
          component.calendars = [];
          cy.get(".slot.busy").should("not.exist");
        });

      const calendars = [
        {
          availability: "free",
          timeslots: [
            {
              start_time: new Date(new Date().setHours(1, 0, 0, 0)),
              end_time: new Date(new Date().setHours(3, 0, 0, 0)),
            },
            {
              start_time: new Date(new Date().setHours(8, 0, 0, 0)),
              end_time: new Date(new Date().setHours(16, 0, 0, 0)),
            },
          ],
        },
      ];

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.calendars = calendars;
          cy.get(".slot.busy").should("exist");
          cy.get(".slot.free").should("have.length", 40);
        });

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.slot_size = 30;
          cy.get(".slot.free").should("have.length", 20);
        });
    });

    it("available time slot toggles (un)selected class", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.allow_booking = true;
          cy.get(".slot.free").first().should("have.class", "unselected");
          cy.get(".slot.free").first().click();
          cy.get(".slot.free").first().should("have.class", "selected");
        });
    });

    it("should not show confirm button when multiple time slots are selected", () => {
      cy.get(".slot.free").each((slot, index) => {
        if (index === 0 || index === 1 || index === 3) {
          cy.get(slot).click();
        }
      });
      cy.get("button.confirm").should("not.exist");
    });
  });

  describe("unavailable times", () => {
    it("observes unavailable times", () => {
      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.calendars = [];
          cy.get(".slot.busy").should("not.exist");
        });

      const calendars = [
        {
          availability: "busy",
          timeslots: [
            {
              start_time: new Date(new Date().setHours(1, 0, 0, 0)),
              end_time: new Date(new Date().setHours(3, 0, 0, 0)),
            },
            {
              start_time: new Date(new Date().setHours(8, 0, 0, 0)),
              end_time: new Date(new Date().setHours(16, 0, 0, 0)),
            },
          ],
        },
      ];

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.calendars = calendars;
          cy.get(".slot.busy").should("exist");
          cy.get(".slot.free").should("have.length", 56);
        });

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.slot_size = 30;
          cy.get(".slot.free").should("have.length", 28);
        });
    });

    it("busy time slot is disabled", () => {
      cy.get(".slot.busy").should("be.disabled");
    });
  });

  describe("multiple availability sets", () => {
    it("observes multiple availabilites", () => {
      const calendars = [
        {
          email_address: "person@name.com",
          availability: "busy",
          timeslots: [
            {
              start_time: new Date(new Date().setHours(3, 0, 0, 0)),
              end_time: new Date(new Date().setHours(6, 0, 0, 0)),
            },
            {
              start_time: new Date(new Date().setHours(9, 0, 0, 0)),
              end_time: new Date(new Date().setHours(15, 0, 0, 0)),
            },
          ],
        },
        {
          email_address: "thelonious@nylas.com",
          availability: "busy",
          timeslots: [
            {
              start_time: new Date(new Date().setHours(4, 0, 0, 0)),
              end_time: new Date(new Date().setHours(11, 0, 0, 0)),
            },
          ],
        },
        {
          email_address: "booker@nylas.com",
          availability: "busy",
          timeslots: [
            {
              start_time: new Date(new Date().setHours(5, 30, 0, 0)),
              end_time: new Date(new Date().setHours(16, 0, 0, 0)),
            },
          ],
        },
      ];

      cy.get("nylas-availability")
        .as("availability")
        .then((element) => {
          const component = element[0];
          component.calendars = calendars;
          cy.get(".slot.partial").should("exist");
          cy.get(".slot.partial").should("have.length", 42);
          cy.get(".slot.busy").should("have.length", 10);
          cy.get(".slot.free").should("have.length", 44);
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
        .contains(
          new Date().toLocaleString("default", {
            day: "numeric",
          }),
        );
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
            .contains(
              nextWeek.toLocaleString("default", {
                day: "numeric",
              }),
            );
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

  describe("selecting avaialble time slots", () => {
    const consecutiveSlotEndTime = new Date(
      `${new Date().toLocaleDateString()} 15:30:00`,
    ).toISOString();
    const singularSlotStartTime = new Date(
      `${new Date().toLocaleDateString()} 15:45:00`,
    ).toISOString();
    const singularSlotEndTime = new Date(
      `${new Date().toLocaleDateString()} 16:00:00`,
    ).toISOString();

    it("should combine consecutive time slots", (done) => {
      cy.get("nylas-availability").then((element) => {
        const component = element[0];
        component.allow_booking = true;
        component.max_bookable_slots = 3;
        component.calendars = [
          {
            emailAddress: "person@name.com",
            availability: "free",
            timeslots: [
              {
                start_time: new Date(new Date().setHours(15, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17, 0, 0, 0)),
              },
            ],
          },
          {
            emailAddress: "thelonious@nylas.com",
            availability: "free",
            timeslots: [
              {
                start_time: new Date(new Date().setHours(15, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17, 0, 0, 0)),
              },
            ],
          },
          {
            emailAddress: "booker@nylas.com",
            availability: "free",
            timeslots: [
              {
                start_time: new Date(new Date().setHours(15, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17, 0, 0, 0)),
              },
            ],
          },
        ];

        component.addEventListener("timeSlotChosen", (event) => {
          expect(event.detail).to.have.ownProperty("timeSlots");
          expect(event.detail.timeSlots).to.have.lengthOf(2);
          expect(event.detail.timeSlots[0].end_time.toISOString()).eq(
            consecutiveSlotEndTime,
          );
          expect(event.detail.timeSlots[1].start_time.toISOString()).eq(
            singularSlotStartTime,
          );
          expect(event.detail.timeSlots[1].end_time.toISOString()).eq(
            singularSlotEndTime,
          );
          done();
        });
      });

      cy.get(".slot.free").each((slot, index) => {
        if (index === 0 || index === 1 || index === 3) {
          cy.get(slot).click();
        }
      });
      cy.get("button.confirm").should("exist");
      cy.get("button.confirm").click();
    });
  });
});
