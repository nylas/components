let testAvailabilityComponent;
beforeEach(() => {
  cy.visit("/components/availability/src/index.html");
  cy.get("nylas-availability").then((element) => {
    const component = element[0];
    component.setAttribute("id", "test-availability");
    testAvailabilityComponent = component;
    cy.get(testAvailabilityComponent)
      .should("have.prop", "id")
      .and("equal", "test-availability");
  });
});

describe("availability component", () => {
  beforeEach(() => {
    cy.intercept({
      method: "POST",
      url: "/middleware/calendars/availability",
    });
  });

  describe("available times", () => {
    beforeEach(() => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
      });
    });

    it("observes available times", () => {
      cy.get(testAvailabilityComponent).then((element) => {
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

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        cy.get(".slot.busy").should("exist");
        cy.get(".slot.free").should("have.length", 40);
      });

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.slot_size = 30;
        cy.get(".slot.free").should("have.length", 20);
      });
    });

    it("Toggles (un)selected class based on isBookable property", () => {
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 30);
      const currentHour = new Date();
      currentHour.setMinutes(0, 0, 0);
      //Get the closest full hour prior to current time, slots isBookable should be false
      cy.get(
        `button.slot.unselected[data-start-time="${currentHour.toLocaleString()}"]`,
      )
        .first()
        .click();
      cy.get(".slot.selected").should("have.length", 0);

      //Get the closest next hour after the current hour, slots isBookable should be true
      currentHour.setHours(currentHour.getHours() + 2);
      cy.get(
        `button.slot.unselected[data-start-time="${currentHour.toLocaleString()}"]`,
      )
        .first()
        .click();
      cy.get(".slot.selected").should("have.length", 1);
    });

    it("should not show confirm button when multiple time slots are selected", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        element[0].participants = ["nylascypresstest@gmail.com"];
      });

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
      cy.get(testAvailabilityComponent).then((element) => {
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

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        cy.get(".slot.busy").should("exist");
        cy.get(".slot.free").should("have.length", 56);
      });

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.slot_size = 30;
        cy.get(".slot.free").should("have.length", 28);
      });
    });
  });

  describe("multiple availability sets", () => {
    const calendars = [
      {
        emailAddress: "person@name.com",
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
        emailAddress: "thelonious@nylas.com",
        availability: "busy",
        timeslots: [
          {
            start_time: new Date(new Date().setHours(4, 0, 0, 0)),
            end_time: new Date(new Date().setHours(11, 0, 0, 0)),
          },
        ],
      },
      {
        emailAddress: "booker@nylas.com",
        availability: "busy",
        timeslots: [
          {
            start_time: new Date(new Date().setHours(5, 30, 0, 0)),
            end_time: new Date(new Date().setHours(16, 0, 0, 0)),
          },
        ],
      },
    ];

    beforeEach(() => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
      });
    });

    it("observes multiple availabilites", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        cy.get(".slot.partial").should("exist");
        cy.get(".slot.partial").should("have.length", 42);
        cy.get(".slot.busy").should("have.length", 10);
        cy.get(".slot.free").should("have.length", 44);
      });
    });

    it("requires certain participants be present for booking", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        cy.get(
          `.slot[data-start-time='${new Date().toLocaleDateString()}, 6:30:00 AM']`,
        )
          .should("have.class", "partial")
          .then(() => {
            component.required_participants = [calendars[1].emailAddress];
            cy.get(
              `.slot[data-start-time='${new Date().toLocaleDateString()}, 6:30:00 AM']`,
            ).should("have.class", "busy");
          });
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
      cy.get(testAvailabilityComponent).then((element) => {
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
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.end_hour = 8;
        const end_time = new Date();
        end_time.setHours(8, 0, 0);
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
      cy.get(testAvailabilityComponent).then((element) => {
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
      cy.get(testAvailabilityComponent).then((element) => {
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
      cy.viewport(1500, 550);
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.dates_to_show = 7;
        cy.get("div.day").should("have.length", 7);
      });
    });
  });

  describe("axis ticks", () => {
    beforeEach(() => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
      });
    });

    it("shows ticks by default", () => {
      cy.get("ul.ticks").should("exist");
    });

    it("allows you to disable ticks column", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.show_ticks = false;
        cy.get("ul.ticks").should("not.exist");
      });
    });

    it("dynamically skips ticks for screen 550 x 1500", () => {
      cy.viewport(550, 1500);
      cy.get("li.tick").should("have.length", 24);
    });

    it("dynamically skips ticks for screen 550 x 750", () => {
      cy.viewport(550, 750);
      cy.get("li.tick").should("have.length", 8);
    });

    it("dynamically skips ticks for screen 550 x 150", () => {
      cy.viewport(550, 150);
      cy.get("li.tick").should("have.length", 4);
    });

    it("dynamically skips ticks for screen 550 x 2500", () => {
      cy.viewport(550, 2500);
      cy.get("li.tick").should("have.length", 48);
    });

    it("dynamically skips ticks for screen 550 x 4000", () => {
      cy.viewport(550, 4000);
      cy.get("li.tick").should("have.length", 96);
    });

    it("dynamically skips ticks with slot size 60", () => {
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 60);

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
      });
      cy.get("button.slot").should("have.length", 24);
    });

    it("dynamically skips ticks with slot size 30", () => {
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 30);
      cy.get("button.slot").should("have.length", 48);
    });

    it("dynamically skips ticks with slot size 15", () => {
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 15);
      cy.get(testAvailabilityComponent).invoke("attr", "end_hour", 8);
      cy.viewport(550, 1500);
      cy.get("button.slot").should("have.length", 32);
    });
  });

  describe("selecting available time slots", () => {
    let selectedTimeslots = [];
    let availabilityComponent;

    beforeEach(() => {
      cy.intercept({
        method: "POST",
        url: "/middleware/calendars/availability",
      });

      selectedTimeslots = [];

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];

        availabilityComponent = component;
        component.participants = [];
        component.allow_booking = true;
        component.max_bookable_slots = 3;

        component.calendars = [
          {
            availability: "free",
            timeslots: [
              {
                start_time: new Date(new Date().setHours(15 - 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16 - 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(15, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(15 + 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16 + 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16 + 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17 + 24, 0, 0, 0)),
              },
            ],
            account: {
              emailAddress: "person@name.com",
              firstName: "Jim",
              lastName: "Person",
              avatarUrl: "",
            },
          },
          {
            emailAddress: "thelonious@nylas.com",
            availability: "free",
            timeslots: [
              {
                start_time: new Date(new Date().setHours(15 - 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16 - 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(15, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(15 + 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16 + 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16 + 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17 + 24, 0, 0, 0)),
              },
            ],
            account: {
              emailAddress: "thelonious@nylas.com",
              firstName: "Thelonious",
              lastName: "",
              avatarUrl: "",
            },
          },
          {
            emailAddress: "booker@nylas.com",
            availability: "free",
            timeslots: [
              {
                start_time: new Date(new Date().setHours(15 - 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16 - 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(15, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(15 + 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(16 + 24, 0, 0, 0)),
              },
              {
                start_time: new Date(new Date().setHours(16 + 24, 0, 0, 0)),
                end_time: new Date(new Date().setHours(17 + 24, 0, 0, 0)),
              },
            ],
            account: {
              emailAddress: "booker@nylas.com",
              firstName: "Bill",
              lastName: "Ooker",
              avatarUrl: "",
            },
          },
        ];

        component.addEventListener("timeSlotChosen", (event) => {
          // expect(event.detail).to.have.ownProperty("timeSlots");
          selectedTimeslots = event.detail.timeSlots;
        });
      });

      cy.wait(3000); // TODO: have this as a wait for render to be complete instead of a timer
    });

    it("should combine consecutive time slots", (done) => {
      const consecutiveSlotEndTime = new Date(
        `${new Date().toLocaleDateString()} 15:30:00`,
      ).toISOString();
      const singularSlotStartTime = new Date(
        `${new Date().toLocaleDateString()} 15:45:00`,
      ).toISOString();
      const singularSlotEndTime = new Date(
        `${new Date().toLocaleDateString()} 16:00:00`,
      ).toISOString();

      cy.get(".slot.free")
        .eq(0)
        .click()
        .then(() => {
          expect(selectedTimeslots).to.have.lengthOf(1);
          cy.get(".slot.free")
            .eq(3)
            .click()
            .then(() => {
              expect(selectedTimeslots).to.have.lengthOf(2);
              cy.get(".slot.free")
                .eq(1)
                .click()
                .then(() => {
                  expect(selectedTimeslots).to.have.lengthOf(2);
                  expect(selectedTimeslots[0].end_time.toISOString()).eq(
                    consecutiveSlotEndTime,
                  );
                  expect(selectedTimeslots[1].start_time.toISOString()).eq(
                    singularSlotStartTime,
                  );
                  expect(selectedTimeslots[1].end_time.toISOString()).eq(
                    singularSlotEndTime,
                  );
                  done();
                });
            });
        });
    });

    it("should prevent booking events in the past", () => {
      // Change to previous date
      cy.get("div.change-dates").should("exist");
      cy.get(".change-dates button:eq(0)").click();

      cy.get(".slot.free").should("exist");
      expect(selectedTimeslots).to.have.lengthOf(0);
      cy.get(".slot.free")
        .eq(0)
        .click()
        .then(() => {
          expect(selectedTimeslots).to.have.lengthOf(0);
        });
    });

    it("should prevent booking on days before min_book_ahead_days", (done) => {
      // Check that we can book on current date if min_book_ahead_days is 0
      availabilityComponent.min_book_ahead_days = 0;

      cy.get(".slot.free").should("exist");
      expect(selectedTimeslots).to.have.lengthOf(0);
      cy.get(".slot.free")
        .eq(0)
        .click()
        .then(() => {
          expect(selectedTimeslots).to.have.lengthOf(1);

          // Check that min_book_ahead_days is respected
          availabilityComponent.min_book_ahead_days = 1;
          cy.get(".slot.free").should("exist");
          expect(selectedTimeslots).to.have.lengthOf(0);
          cy.get(".slot.free")
            .eq(0)
            .click()
            .then(() => {
              expect(selectedTimeslots).to.have.lengthOf(0);

              // Change to next date
              cy.get("div.change-dates").should("exist");
              cy.get(".change-dates button:eq(1)").click();

              expect(selectedTimeslots).to.have.lengthOf(0);
              cy.get(".slot.free")
                .eq(0)
                .click()
                .then(() => {
                  expect(selectedTimeslots).to.have.lengthOf(1);
                  done();
                });
            });
        });
    });

    it("should prevent booking on dates after max_book_ahead_days", (done) => {
      // Check that we can book on current date if max_book_ahead_days is 0
      availabilityComponent.max_book_ahead_days = 0;
      cy.get(".slot.free").should("exist");
      expect(selectedTimeslots).to.have.lengthOf(0);
      cy.get(".slot.free")
        .eq(0)
        .click()
        .then(() => {
          expect(selectedTimeslots).to.have.lengthOf(1);
          selectedTimeslots = [];

          // Change to next date
          cy.get("div.change-dates").should("exist");
          cy.get(".change-dates button:eq(1)").click();

          expect(selectedTimeslots).to.have.lengthOf(0);
          cy.get(".slot.free")
            .eq(0)
            .click()
            .then(() => {
              expect(selectedTimeslots).to.have.lengthOf(0);

              availabilityComponent.max_book_ahead_days = 1;

              cy.get(".slot.free")
                .eq(0)
                .click()
                .then(() => {
                  expect(selectedTimeslots).to.have.lengthOf(1);
                  done();
                });
            });
        });
    });
  });

  describe("weeks and weekends", () => {
    beforeEach(() => {
      cy.viewport(1500, 550);
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
      });
    });

    it("Handles week_view false", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.start_date = new Date("2021-04-06 00:00");
        component.show_as_week = false;
        cy.get("div.day:eq(0) header h2").contains("Tue");
        cy.get("div.day:eq(2)").should("not.exist");
      });
    });

    it("Handles week_view true", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.start_date = new Date("2021-04-06 00:00");
        component.show_as_week = true;
        cy.wait(100);
        cy.get("div.day:eq(0) header h2").contains("Sun");
        cy.get("div.day:eq(6) header h2").contains("Sat");
      });
    });

    it("Drops weekends like a bad habit: today view", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.start_date = new Date("2021-04-06 00:00");
        component.dates_to_show = 7;
        component.show_as_week = false;
        component.show_weekends = false;
        cy.get("div.day:eq(0) header h2").contains("Tue");
        cy.get("div.day:eq(4) header h2").contains("Mon");
        cy.get("div.day:eq(5) header h2").contains("Tue");
      });
    });

    it("Drops weekends like a bad habit: week view", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.start_date = new Date("2021-04-06 00:00");
        component.dates_to_show = 7;
        component.show_as_week = true;
        component.show_weekends = false;
        cy.wait(100);
        cy.get("div.day:eq(0) header h2").contains("Mon");
        cy.get("div.day:eq(4) header h2").contains("Fri");
        cy.get("div.day:eq(5) header h2").should("not.exist");
      });
    });
  });

  describe("date changes", () => {
    beforeEach(() => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
      });
    });

    it("Shows date change header by default", () => {
      cy.get("div.change-dates").should("exist");
    });
    it("Does not show date change header when date change is disallowed", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.allow_date_change = false;
        cy.get("div.change-dates").should("not.exist");
      });
    });
    it("Does not show date change header when date change is allowed", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.allow_date_change = true;
        cy.get("div.change-dates").should("exist");
      });
    });
    it("Moves me from Fri to Monday when weekends are disallowed", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.allow_date_change = true;
        component.show_weekends = true;
        const Fri = new Date("May 14 2021");
        component.start_date = Fri;
        cy.get("div.change-dates").should("exist");
        cy.get(".change-dates button:eq(1)").click();
        cy.get("header h2")
          .contains(15)
          .then(() => {
            component.show_weekends = false;
            cy.get("header h2").contains(17);
          });
      });
    });
    it("Moves me from Monday to Fri on prev click when weekends are disallowed", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.allow_date_change = true;
        component.show_weekends = true;
        const monday = new Date("May 17 2021");
        component.start_date = monday;
        cy.get("div.change-dates").should("exist");
        cy.get(".change-dates button:eq(0)").click();
        cy.get("header h2")
          .contains(16)
          .then(() => {
            component.show_weekends = false;
            cy.get(".change-dates button:eq(0)").click();
            cy.get("header h2").contains(14);
          });
      });
    });
    it("Moves multiple-shown-dates when weekends are disallowed", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.allow_date_change = true;
        component.show_weekends = false;
        component.dates_to_show = 3;
        const monday = new Date("May 17 2021");
        component.start_date = monday;
        cy.get("div.change-dates").should("exist");
        cy.get(".change-dates button:eq(1)").click();
        cy.get(".day:eq(0) header h2").contains("Thu");
        cy.get(".day:eq(1) header h2").contains("Fri");
        cy.get(".day:eq(2) header h2")
          .contains("Mon")
          .then(() => {
            cy.get(".change-dates button:eq(1)").click();
            cy.get(".day:eq(0) header h2").contains("Tue");
            cy.get(".day:eq(1) header h2").contains("Wed");
            cy.get(".day:eq(2) header h2").contains("Thu");
          });
      });
    });
    it("Moves a full week on prev/next push", () => {
      cy.viewport(1500, 550);
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.allow_date_change = true;
        component.show_weekends = false;
        component.show_as_week = true;
        const monday = new Date("May 17 2021");
        component.start_date = monday;
        cy.get("div.change-dates").should("exist");
        cy.get(".change-dates button:eq(1)").click();
        cy.get(".day").should("have.length", 5);
        cy.get(".day:eq(0) header h2").contains("Mon");
        cy.get(".day:eq(0) header h2").contains("24");
        cy.get(".day:eq(1) header h2").contains("Tue");
        cy.get(".day:eq(4) header h2")
          .contains("Fri")
          .then(() => {
            cy.get(".change-dates button:eq(0)").click();
            cy.get(".change-dates button:eq(0)").click();
            cy.get(".day:eq(0) header h2").contains("Mon");
            cy.get(".day:eq(0) header h2").contains("10");
            cy.get(".day:eq(4) header h2").contains("Fri");
          });
      });
    });
  });

  describe("change colours", () => {
    beforeEach(() => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
      });
    });

    it("changes colour by prop", () => {
      cy.get(".epoch.partial .inner").should(
        "not.have.css",
        "background-color",
        "rgb(0, 0, 0)",
      );
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.partial_color = "#222";
        component.busy_color = "#000";
        component.free_color = "#444";
        cy.get(".epoch.partial .inner").should(
          "have.css",
          "background-color",
          "rgb(45, 45, 45)",
        ); // 45: 2/3 availability = 2/3 distance between 000 and 444 in base RGB.
      });
    });
  });

  describe("list view", () => {
    it("Shows scheduler view by default", () => {
      cy.get(testAvailabilityComponent).then(() => {
        cy.get(".epochs").should("exist");
        cy.get(".slots").should("exist");
        cy.get(".slot-list").should("not.exist");
      });
    });
    it("Shows list view by passed property", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.view_as = "list";

        cy.get(".epochs").should("not.exist");
        cy.get(".slots").should("not.exist");
        cy.get(".slot-list").should("exist");
      });
    });
  });

  describe("Limiting screen size", () => {
    it("Cuts off the number of days if they drop below 100px in width", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.dates_to_show = 7;
        cy.viewport(1500, 550);
        cy.wait(100);
        cy.get(".days .day").should("have.length", 7);
        cy.viewport(1200, 550);
        cy.get(".days .day").should("have.length", 6);
        cy.viewport(600, 550);
        cy.get(".days .day").should("have.length", 1);
        cy.viewport(3000, 550);
        cy.get(".days .day").should("have.length", 7);
      });
    });
    it("Allows you to navigate a squashed schedule", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = [];
        component.dates_to_show = 7;
        component.start_date = new Date("2021-04-06 00:00");
        component.show_as_week = false;
        cy.viewport(800, 550);
        cy.get("div.day:eq(0) header h2").contains("Tue");
        cy.get("div.day:eq(2) header h2").contains("Thu");
        cy.get("div.day:eq(3)").should("not.exist");
        cy.get(".change-dates button:eq(1)").click();
        cy.get(".day:eq(0) header h2").contains("Fri");
        cy.get(".day:eq(1) header h2").contains("Sat");
      });
    });
    it("Handles show_as_week gracefully when squashed", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.dates_to_show = 7;
        component.start_date = new Date("2021-04-06 00:00");
        component.show_as_week = true;
        cy.viewport(1800, 550);
        cy.wait(100);
        cy.get("div.day:eq(0) header h2").contains("Sun");
        cy.get("div.day:eq(0) header h2").contains("4");
        cy.get("div.day:eq(2) header h2").contains("Tue");
        cy.get(".days .day").should("have.length", 7);

        cy.viewport(800, 550);
        cy.wait(100); // we need to arbitrarily wait so viewport finishes resizing
        cy.get("div.day:eq(0) header h2").contains("Tue");
        cy.get(".days .day").should("have.length", 3);
        cy.get(".change-dates button:eq(1)").click();
        cy.get(".day:eq(0) header h2").contains("Fri");
        cy.get(".day:eq(1) header h2").contains("Sat");
        cy.get(".change-dates button:eq(0)").click();
        cy.get(".change-dates button:eq(0)").click();
        cy.get(".day:eq(0) header h2").contains("Sat");
        cy.get(".day:eq(1) header h2").contains("Sun");
        cy.get(".days .day").should("have.length", 3);

        cy.viewport(1800, 550);
        cy.wait(100);
        cy.get("div.day:eq(0) header h2").contains("Sun");
        cy.get("div.day:eq(0) header h2").contains("28");
        cy.get("div.day:eq(2) header h2").contains("Tue");
      });
    });
  });

  describe("Event Buffer", () => {
    it("With 0 min buffer time", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.event_buffer = 0;
        cy.get(".slot.busy").should("have.length", 5);
        cy.get(".slot.free").should("have.length", 4);
      });
    });
    it("Adds 15 min buffer time", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.event_buffer = 15;
        cy.get(".slot.busy").should("have.length", 6);
        cy.get(".slot.free").should("have.length", 3);
      });
    });
    it("Adds 30 min buffer time", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.event_buffer = 30;
        cy.get(".slot.busy").should("have.length", 7);
        cy.get(".slot.free").should("have.length", 2);
      });
    });
  });

  describe("overbooked threshold prop", () => {
    const calendars = [
      {
        availability: "busy",
        timeslots: [
          {
            start_time: new Date(new Date().setHours(0, 0, 0, 0)),
            end_time: new Date(new Date().setHours(6, 0, 0, 0)),
          },
        ],
        account: {
          emailAddress: "person@name.com",
          firstName: "Jim",
          lastName: "Person",
          avatarUrl: "",
        },
      },
      {
        availability: "busy",
        timeslots: [
          {
            start_time: new Date(new Date().setHours(5, 0, 0, 0)),
            end_time: new Date(new Date().setHours(12, 0, 0, 0)),
          },
        ],
        account: {
          emailAddress: "thelonious@nylas.com",
          firstName: "Thelonious",
          lastName: "Bacon",
          avatarUrl: "",
        },
      },
    ];

    it("shows busy when slots booked over threshold", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        component.overbooked_threshold = 100;
        cy.get(".slot.partial").should("exist");
        cy.get(".slot.busy").should("have.length", 4);
      });

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        component.overbooked_threshold = 24;
        cy.get(".slot.partial").should("not.exist");
        cy.get(".slot.busy").should("have.length", 96);
      });

      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        component.overbooked_threshold = 25;
        cy.get(".slot.partial").should("exist");
        cy.get(".slot.partial").should("have.length", 72);
        cy.get(".slot.busy").should("have.length", 24);
      });
    });

    it("handles overbooked_threshold correctly with reduced hours", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        component.start_hour = 0;
        component.end_hour = 12;
        component.overbooked_threshold = 50;
        cy.get(".slot.partial").should("exist");
        cy.get(".slot.partial").should("have.length", 24);
        cy.get(".slot.busy").should("have.length", 24);
      });
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.calendars = calendars;
        component.start_hour = 0;
        component.end_hour = 12;
        component.overbooked_threshold = 49;
        cy.get(".slot.partial").should("have.length", 0);
        cy.get(".slot.busy").should("have.length", 48);
      });
    });
  });

  describe("Capacity", () => {
    const timeSlot = {
      start_time: new Date(new Date().setHours(3, 0, 0, 0)),
      end_time: new Date(new Date().setHours(6, 0, 0, 0)),
    };
    const calendar = [
      {
        availability: "busy",
        timeslots: [timeSlot],
        account: {
          emailAddress: "person@name.com",
          firstName: "Jim",
          lastName: "Person",
          avatarUrl: "",
        },
      },
    ];
    it("should have busy for 1 event with capacity 1", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.capacity = 1;
        component.calendars = calendar;
        cy.get(".slot.busy").should("have.length", 12);
      });
    });
    it("should have free for 1 event with capacity 2", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.capacity = 2;
        calendar[0].timeslots.concat([timeSlot]);
        expect(calendar[0].timeslots.length === 2);
        component.calendars = calendar;
        cy.get(".slot.busy").should("have.length", 0);
      });
    });
  });

  describe("Top-of-hour requirement", () => {
    it("should remove the ability to book slots that don't start at :00", () => {
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.participants = ["nylascypresstest@gmail.com"];
        cy.get(".slot.busy").should("have.length", 5);
      });
      cy.get(testAvailabilityComponent).then((element) => {
        const component = element[0];
        component.mandate_top_of_hour = true;
        cy.get(".slot.busy").should("have.length", 74);
      });
    });
  });

  describe("Dynamically generate time slots based on manifest", () => {
    it("Updates slot_size will change number of slots on screen", () => {
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 15);
      cy.get("button.slot").should("have.length", 96);
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 30);
      cy.get("button.slot").should("have.length", 48);
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 60);
      cy.get("button.slot").should("have.length", 24);
      cy.get(testAvailabilityComponent).invoke("attr", "end_hour", 18);
      cy.get("button.slot").should("have.length", 18);
      cy.get(testAvailabilityComponent).invoke("attr", "start_hour", 8);
      cy.get("button.slot").should("have.length", 10);
    });

    it("Updates partial_bookable_ratio/Participant Threshold will change availability", () => {
      cy.get(testAvailabilityComponent).invoke(
        "attr",
        "partial_bookable_ratio",
        0.5,
      );
      cy.get("button.slot.busy").should("have.length", 20);
      cy.get(testAvailabilityComponent).invoke(
        "attr",
        "partial_bookable_ratio",
        1,
      );
      cy.get("button.slot.busy").should("have.length", 92);
    });

    it("Updates mandate_top_of_hour will change availability", () => {
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 30);
      cy.get(".controls")
        .get('input[type="radio"][name="mandate-top-of-hour"][value="true"]')
        .first()
        .check();
      cy.get("button.slot.busy").should("have.length", 26);
    });

    it("Updates open_hours/Block Lunch control will change availability", () => {
      cy.get(testAvailabilityComponent).invoke("attr", "slot_size", 30);
      cy.get(".controls")
        .get('input[type="radio"][name="block-lunch"][value="everyday"]')
        .first()
        .check();
      cy.get("button.slot.closed").should("have.length", 25);
    });
  });
});
