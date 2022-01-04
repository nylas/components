// Returns a new date object for December 15, 2021 at 9:00 am
const frozenDateTime = () => new Date(2021, 11, 15, 9, 0, 0);
const testUser = ["nylascypresstest@gmail.com"];

beforeEach(() => {
  cy.clock(frozenDateTime().getTime(), ["Date"]);
  cy.visitComponentPage(
    "/components/availability/src/index.html",
    "nylas-availability",
    "demo-availability",
  );
  cy.get("@testComponent").invoke("attr", "participants", testUser);
  cy.get("@testComponent")
    .should("have.prop", "id")
    .and("equal", "test-availability");
});

describe("available times", () => {
  const calendars = [
    {
      availability: "free",
      timeslots: [
        {
          start_time: frozenDateTime().setHours(1, 0, 0, 0),
          end_time: frozenDateTime().setHours(3, 0, 0, 0),
        },
        {
          start_time: frozenDateTime().setHours(8, 0, 0, 0),
          end_time: frozenDateTime().setHours(16, 0, 0, 0),
        },
      ],
    },
  ];

  beforeEach(() => {
    cy.get("@testComponent").then((element) => {
      element[0].calendars = calendars;
    });
  });

  it("observes available times", () => {
    cy.get(".slot.busy").should("exist");
    cy.get(".slot.free").should("have.length", 40);
  });

  it("decreases available slots when slot size is increased", () => {
    cy.get(".slot.free").should("have.length", 40);
    cy.get("@testComponent").invoke("attr", "slot_size", 30);
    cy.get(".slot.free").should("have.length", 20);
  });
});

describe("Booking time slots", () => {
  it("Toggles (un)selected class", () => {
    cy.get("@testComponent").invoke("attr", "slot_size", 30);
    const currentHour = frozenDateTime();
    currentHour.setMinutes(0, 0, 0);
    currentHour.setHours(currentHour.getHours() - 1);

    //Get the closest full hour prior to current time, slots isBookable should be false
    cy.get(
      `button.slot.unselected[data-start-time="${currentHour.toLocaleString()}"]`,
    )
      .first()
      .click();
    cy.get(".slot.selected").should("not.exist");

    //Get the closest next hour after the current hour, slots isBookable should be true
    currentHour.setHours(currentHour.getHours() + 2);
    cy.get(
      `button.slot.unselected[data-start-time="${currentHour.toLocaleString()}"]`,
    )
      .first()
      .click();
    cy.get(".slot.selected").should("have.length", 1);

    it("should not show confirm button when multiple time slots are selected", () => {
      cy.get(".slot.free").each((slot, index) => {
        if (index === 0 || index === 1 || index === 3) {
          cy.get(slot).click();
        }
      });
      cy.get("button.confirm").should("not.exist");
    });
  });

  describe("Single availability", () => {
    it("observes unavailable times", () => {
      cy.get("@testComponent").then((element) => {
        element[0].participants = [];
        element[0].calendars = [];
        cy.get(".slot.busy").should("not.exist");
      });
    });

    it("observes available times", () => {
      const calendars = [
        {
          availability: "busy",
          timeslots: [
            {
              start_time: frozenDateTime().setHours(1, 0, 0, 0),
              end_time: frozenDateTime().setHours(3, 0, 0, 0),
            },
            {
              start_time: frozenDateTime().setHours(8, 0, 0, 0),
              end_time: frozenDateTime().setHours(16, 0, 0, 0),
            },
          ],
        },
      ];

      cy.get("@testComponent").then((element) => {
        element[0].calendars = calendars;
        cy.get(".slot.busy").should("exist");
        cy.get(".slot.free").should("have.length", 56);
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
            start_time: frozenDateTime().setHours(3, 0, 0, 0),
            end_time: frozenDateTime().setHours(6, 0, 0, 0),
          },
          {
            start_time: frozenDateTime().setHours(9, 0, 0, 0),
            end_time: frozenDateTime().setHours(15, 0, 0, 0),
          },
        ],
      },
      {
        emailAddress: "thelonious@nylas.com",
        availability: "busy",
        timeslots: [
          {
            start_time: frozenDateTime().setHours(4, 0, 0, 0),
            end_time: frozenDateTime().setHours(11, 0, 0, 0),
          },
        ],
      },
      {
        emailAddress: "booker@nylas.com",
        availability: "busy",
        timeslots: [
          {
            start_time: frozenDateTime().setHours(5, 30, 0, 0),
            end_time: frozenDateTime().setHours(16, 0, 0, 0),
          },
        ],
      },
    ];

    beforeEach(() => {
      cy.get("@testComponent").then((element) => {
        element[0].calendars = calendars;
      });
    });

    it("observes availability across multiple calendars", () => {
      cy.get(".slot.partial").should("have.length", 42);
      cy.get(".slot.busy").should("have.length", 10);
      cy.get(".slot.free").should("have.length", 44);
    });

    it("requires certain participants be present for booking", () => {
      cy.get(
        `.slot[data-start-time='${frozenDateTime().toLocaleDateString()}, 6:30:00 AM']`,
      ).should("have.class", "partial");
      cy.get("@testComponent").then((element) => {
        element[0].required_participants = [calendars[1].emailAddress];
        cy.get(
          `.slot[data-start-time='${frozenDateTime().toLocaleDateString()}, 6:30:00 AM']`,
        ).should("have.class", "busy");
      });
    });
  });

  describe("start and ending hour props", () => {
    it("Shows timeslots for 24 hours by default", () => {
      const today = frozenDateTime();
      today.setHours(0, 0, 0);
      const tomorrow = frozenDateTime();
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
      const start_time = frozenDateTime();
      cy.get("@testComponent").invoke("attr", "start_hour", 8);
      cy.get("@testComponent").then((element) => {
        start_time.setHours(element[0].start_hour, 0, 0);
        cy.get(".slot").should("have.length", 64);
        cy.get(".slot")
          .first()
          .invoke("attr", "data-start-time")
          .should("eq", start_time.toLocaleString());
      });
    });

    it("Updates end_hour via component prop", () => {
      const end_time = frozenDateTime();
      cy.get("@testComponent").invoke("attr", "end_hour", 8);
      end_time.setHours(8, 0, 0);
      cy.get(".slot").should("have.length", 32);
      cy.get(".slot")
        .last()
        .invoke("attr", "data-end-time")
        .should("eq", end_time.toLocaleString());
    });
  });

  describe("slot_size prop", () => {
    it("Shows 15 minute time slots as default", () => {
      cy.get(".slot").should("have.length", 96);
    });

    it("Updates slot_size via component prop", () => {
      cy.get("@testComponent").invoke("attr", "slot_size", 60);
      cy.get(".slot").should("have.length", 24);
    });

    it("Updates slot_size via component prop", () => {
      cy.get("@testComponent").invoke("attr", "slot_size", 30);
      cy.get(".slot").should("have.length", 48);
    });
  });

  describe("start_date prop", () => {
    it("Uses today's date as start_date by default", () => {
      cy.get("div.day header h2").invoke("text").should("eq", "15 Wed");
    });

    it("Updates start_date via component prop", () => {
      const nextWeek = frozenDateTime();
      nextWeek.setDate(nextWeek.getDate() + 7);
      cy.get("@testComponent").invoke("attr", "start_date", nextWeek);
      cy.get("div.day header h2").invoke("text").should("eq", "22 Wed");
    });
  });

  describe("dates_to_show prop", () => {
    it("Shows one day by default", () => {
      cy.get("div.day").should("have.length", 1);
    });

    it("Updates dates_to_show via component prop", () => {
      cy.viewport(1500, 550);
      cy.get("@testComponent").invoke("attr", "dates_to_show", 7);
      cy.get("div.day").should("have.length", 7);
    });
  });

  describe("axis ticks", () => {
    it("shows ticks by default", () => {
      cy.get("ul.ticks").should("exist");
    });

    it("allows you to hide ticks column", () => {
      cy.get("@testComponent").invoke("attr", "show_ticks", false);
      cy.get("ul.ticks").should("not.exist");
    });

    it("dynamically skips ticks for screen 550 x 1200", () => {
      cy.viewport(550, 1500);
      cy.get("li.tick").should("have.length", 24);
    });

    it("dynamically skips ticks for screen 550 x 768", () => {
      cy.viewport(550, 750);
      cy.get("li.tick").should("have.length", 8);
    });

    it("dynamically skips ticks for screen 550 x 320", () => {
      cy.viewport(550, 150);
      cy.get("li.tick").should("have.length", 4);
    });

    it("dynamically skips ticks for screen 550 x 2000", () => {
      cy.viewport(550, 2500);
      cy.get("li.tick").should("have.length", 48);
    });

    it("dynamically skips ticks for screen 550 x 4000", () => {
      cy.viewport(550, 4000);
      cy.get("li.tick").should("have.length", 96);
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

      cy.get("@testComponent").then((element) => {
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
                start_time: new Date(
                  frozenDateTime().setHours(15 - 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(16 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(16 - 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(17 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(frozenDateTime().setHours(15, 0, 0, 0)),
                end_time: new Date(frozenDateTime().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(frozenDateTime().setHours(16, 0, 0, 0)),
                end_time: new Date(frozenDateTime().setHours(17, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(15 + 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(16 + 24, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(16 + 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(17 + 24, 0, 0, 0)),
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
                start_time: new Date(
                  frozenDateTime().setHours(15 - 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(16 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(16 - 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(17 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(frozenDateTime().setHours(15, 0, 0, 0)),
                end_time: new Date(frozenDateTime().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(frozenDateTime().setHours(16, 0, 0, 0)),
                end_time: new Date(frozenDateTime().setHours(17, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(15 + 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(16 + 24, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(16 + 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(17 + 24, 0, 0, 0)),
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
                start_time: new Date(
                  frozenDateTime().setHours(15 - 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(16 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(16 - 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(17 - 24, 0, 0, 0)),
              },
              {
                start_time: new Date(frozenDateTime().setHours(15, 0, 0, 0)),
                end_time: new Date(frozenDateTime().setHours(16, 0, 0, 0)),
              },
              {
                start_time: new Date(frozenDateTime().setHours(16, 0, 0, 0)),
                end_time: new Date(frozenDateTime().setHours(17, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(15 + 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(16 + 24, 0, 0, 0)),
              },
              {
                start_time: new Date(
                  frozenDateTime().setHours(16 + 24, 0, 0, 0),
                ),
                end_time: new Date(frozenDateTime().setHours(17 + 24, 0, 0, 0)),
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

      cy.get(".days.loading").should("not.exist");
    });

    xit("should combine consecutive time slots", (done) => {
      const consecutiveSlotEndTime = new Date(
        `${frozenDateTime().toLocaleDateString()} 15:30:00`,
      ).toISOString();
      const singularSlotStartTime = new Date(
        `${frozenDateTime().toLocaleDateString()} 15:45:00`,
      ).toISOString();
      const singularSlotEndTime = new Date(
        `${frozenDateTime().toLocaleDateString()} 16:00:00`,
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

    xit("should prevent booking events in the past", () => {
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

    xit("should prevent booking on days before min_book_ahead_days", (done) => {
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
      cy.get("@testComponent").invoke("attr", "max_book_ahead_days", 0);
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

              cy.get("@testComponent").invoke("attr", "max_book_ahead_days", 1);

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
    it("Doesn't show Sunday as first day", () => {
      cy.get("div.day:eq(2)").should("not.exist");
      cy.get("div.day:eq(0) header h2")
        .invoke("text")
        .should("not.contain", "Sun");
    });

    it("Handles show_as_week true", () => {
      cy.viewport(1800, 550);
      cy.get("@testComponent").invoke("attr", "show_as_week", true);
      cy.intercept("/middleware/calendars").as("calendars");
      cy.wait("@calendars").then(() => {
        cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "12 Sun");
        cy.get("div.day:eq(6) header h2").invoke("text").should("eq", "18 Sat");
      });
    });

    it("Drops weekends like a bad habit: today view", () => {
      cy.get("@testComponent").invoke("attr", "dates_to_show", 6);
      cy.get("@testComponent").invoke("attr", "show_weekends", false);
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "15 Wed");
      cy.get("div.day:eq(4) header h2").invoke("text").should("eq", "21 Tue");
      cy.get("div.day:eq(5) header h2").invoke("text").should("eq", "22 Wed");
    });

    it("Drops weekends like a bad habit: week view", () => {
      cy.viewport(1800, 550);
      cy.get("@testComponent").invoke("attr", "show_as_week", true);
      cy.get("@testComponent").invoke("attr", "show_weekends", false);
      cy.get("div.day").should("have.length", 5);
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "13 Mon");
      cy.get("div.day:eq(4) header h2").invoke("text").should("eq", "17 Fri");
    });
  });

  describe("date changes", () => {
    const monday = new Date(2021, 11, 20, 9, 0, 0);

    beforeEach(() => {
      cy.get("@testComponent").invoke("attr", "allow_date_change", true);
      cy.get("@testComponent").invoke("attr", "start_date", monday);
    });

    it("Does not show date change header when date change is disallowed", () => {
      cy.get("@testComponent").invoke("attr", "allow_date_change", false);
      cy.get("div.change-dates").should("not.exist");
    });

    it("Shows date change header when date change is allowed", () => {
      cy.get("div.change-dates").should("exist");
    });

    it("When it's Friday, next date shown is Monday when weekends are disallowed", () => {
      const friday = new Date(2021, 11, 17, 9, 0, 0);
      cy.get("@testComponent").invoke("attr", "show_weekends", false);
      cy.get("@testComponent").invoke("attr", "start_date", friday);
      cy.get(".change-dates button:eq(1)").click();
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "20 Mon");
    });

    it("When it's Monday, previous date shown is Friday when weekends are disallowed", () => {
      cy.get("@testComponent").invoke("attr", "show_weekends", false);
      cy.get(".change-dates button:eq(0)").click();
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "17 Fri");
    });

    it("Moves multiple-shown-dates when weekends are disallowed", () => {
      cy.get("@testComponent").invoke("attr", "show_weekends", false);
      cy.get("@testComponent").invoke("attr", "dates_to_show", 3);
      cy.get(".change-dates button:eq(1)").click();
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "23 Thu");
      cy.get("div.day:eq(1) header h2").invoke("text").should("eq", "24 Fri");
      cy.get("div.day:eq(2) header h2").invoke("text").should("eq", "27 Mon");
    });

    it.only("Moves a full week when next button is clicked", () => {
      cy.viewport(1500, 550);
      cy.get("@testComponent").invoke("attr", "show_weekends", false);
      cy.get("@testComponent").invoke("attr", "show_as_week", true);
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "20 Mon");
      cy.get("div.day:eq(4) header h2").invoke("text").should("eq", "24 Fri");
      cy.get(".change-dates button:eq(1)").click();
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "27 Mon");
      cy.get("div.day:eq(4) header h2").invoke("text").should("eq", "31 Fri");
    });
  });

  describe("change colours", () => {
    it("changes colour by prop", () => {
      cy.get(".epoch.partial .inner").should(
        "not.have.css",
        "background-color",
        "rgb(0, 0, 0)",
      );
      cy.get("@testComponent").invoke("attr", "partial_color", "#222");
      cy.get("@testComponent").invoke("attr", "busy_color", "#000");
      cy.get("@testComponent").invoke("attr", "free_color", "#444");
      cy.get(".epoch.partial .inner").should(
        "have.css",
        "background-color",
        "rgb(45, 45, 45)",
      ); // 45: 2/3 availability = 2/3 distance between 000 and 444 in base RGB.
    });
  });

  describe("list view", () => {
    it("Shows scheduler view by default", () => {
      cy.get("@testComponent").then(() => {
        cy.get(".epochs").should("exist");
        cy.get(".slots").should("exist");
        cy.get(".slot-list").should("not.exist");
      });
    });
    it("Shows list view by passed property", () => {
      cy.get("@testComponent").invoke("attr", "view_as", "list");
      cy.get(".epochs").should("not.exist");
      cy.get(".slots").should("not.exist");
      cy.get(".slot-list").should("exist");
    });
  });

  describe("Limiting screen size", () => {
    beforeEach(() => {
      cy.get("@testComponent").invoke("attr", "show_as_week", true);
      cy.get("@testComponent").invoke("attr", "dates_to_show", 7);
    });

    it("Cuts off the number of days if viewport 1200px wide", () => {
      cy.viewport(1200, 550);
      cy.get(".days .day").should("have.length", 6);
    });

    it("Cuts off the number of days if viewport 600px wide", () => {
      cy.viewport(600, 550);
      cy.get(".days .day").should("have.length", 1);
    });

    it("Allows you to navigate forward with a squashed schedule and show_as_week as false", () => {
      cy.viewport(800, 550);
      cy.get("@testComponent").invoke("attr", "show_as_week", false);
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "15 Wed");
      cy.get("div.day:eq(2) header h2").invoke("text").should("eq", "17 Fri");
      cy.get(".change-dates button:eq(1)").click();
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "18 Sat");
      cy.get("div.day:eq(2) header h2").invoke("text").should("eq", "20 Mon");
    });

    it("Handles moving forward show_as_week gracefully when squashed", () => {
      cy.viewport(800, 550);
      cy.get(".change-dates button:eq(1)").click();
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "18 Sat");
      cy.get("div.day:eq(2) header h2").invoke("text").should("eq", "20 Mon");
    });

    it("Handles moving backward show_as_week gracefully when squashed", () => {
      cy.viewport(800, 550);
      cy.get(".change-dates button:eq(0)").click();
      cy.get("div.day:eq(0) header h2").invoke("text").should("eq", "12 Sun");
      cy.get("div.day:eq(2) header h2").invoke("text").should("eq", "14 Tue");
    });
  });

  describe("Event Buffer", () => {
    it("Default buffer time is 0 minutes", () => {
      cy.get(".slot.busy").should("have.length", 5);
      cy.get(".slot.free").should("have.length", 4);
    });
    it("Adds 15 min buffer time", () => {
      cy.get("@testComponent").invoke("attr", "event_buffer", 15);
      cy.get(".slot.busy").should("have.length", 6);
      cy.get(".slot.free").should("have.length", 3);
    });
    it("Adds 30 min buffer time", () => {
      cy.get("@testComponent").invoke("attr", "event_buffer", 30);
      cy.get(".slot.busy").should("have.length", 7);
      cy.get(".slot.free").should("have.length", 2);
    });
  });

  describe("overbooked threshold prop", () => {
    const calendars = [
      {
        availability: "busy",
        timeslots: [
          {
            start_time: frozenDateTime().setHours(0, 0, 0, 0),
            end_time: frozenDateTime().setHours(6, 0, 0, 0),
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
            start_time: frozenDateTime().setHours(5, 0, 0, 0),
            end_time: frozenDateTime().setHours(12, 0, 0, 0),
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
    beforeEach(() => {
      cy.get("@testComponent").then((element) => {
        element[0].calendars = calendars;
      });
    });

    it("shows busy when 100% of day is meetings by default", () => {
      cy.get(".slot.partial").should("exist");
      cy.get(".slot.busy").should("have.length", 4);
    });

    it("shows busy when 24% of day is meetings", () => {
      cy.get("@testComponent").invoke("attr", "overbooked_threshold", 24);
      cy.get(".slot.partial").should("not.exist");
      cy.get(".slot.busy").should("have.length", 96);
    });

    it("shows busy when 25% of day is meetings", () => {
      cy.get("@testComponent").invoke("attr", "overbooked_threshold", 25);
      cy.get(".slot.partial").should("have.length", 72);
      cy.get(".slot.busy").should("have.length", 24);
    });

    it("handles overbooked_threshold at 50% correctly with reduced hours", () => {
      cy.get("@testComponent").invoke("attr", "overbooked_threshold", 50);
      cy.get("@testComponent").invoke("attr", "start_hour", 0);
      cy.get("@testComponent").invoke("attr", "end_hour", 12);
      cy.get(".slot.partial").should("exist");
      cy.get(".slot.partial").should("have.length", 24);
      cy.get(".slot.busy").should("have.length", 24);
    });

    it("handles overbooked_threshold at 49% correctly with reduced hours", () => {
      cy.get("@testComponent").invoke("attr", "overbooked_threshold", 49);
      cy.get("@testComponent").invoke("attr", "start_hour", 0);
      cy.get("@testComponent").invoke("attr", "end_hour", 12);
      cy.get(".slot.partial").should("have.length", 0);
      cy.get(".slot.busy").should("have.length", 48);
    });
  });

  describe("Capacity", () => {
    const calendar = [
      {
        availability: "busy",
        timeslots: [
          {
            start_time: frozenDateTime().setHours(3, 0, 0, 0),
            end_time: frozenDateTime().setHours(6, 0, 0, 0),
          },
        ],
      },
    ];
    beforeEach(() => {
      cy.get("@testComponent").then((element) => {
        element[0].calendars = calendar;
      });
    });

    it("should have busy for 1 event with capacity 1", () => {
      cy.get("@testComponent").invoke("attr", "capacity", 1);
      cy.get(".slot.busy").should("have.length", 12);
    });

    it("should have free for 1 event with capacity 2", () => {
      cy.get("@testComponent").invoke("attr", "capacity", 2);
      let timeSlots = calendar[0].timeslots;
      timeSlots = [...timeSlots, calendar.timeslots];
      expect(timeSlots.length === 2);
      cy.get(".slot.busy").should("have.length", 0);
    });
  });

  describe("Top-of-hour requirement", () => {
    it("should remove the ability to book slots that don't start at :00", () => {
      cy.get(".slot.busy").should("have.length", 5);
      cy.get("@testComponent").invoke("attr", "mandate_top_of_hour", true);
      cy.get(".slot.busy").should("have.length", 74);
    });
  });

  describe("Dynamically generate time slots based on manifest", () => {
    it("Updates partial_bookable_ratio/Participant Threshold will change availability", () => {
      cy.get("@testComponent").invoke("attr", "partial_bookable_ratio", 0.5);
      cy.get("button.slot.busy").should("have.length", 20);
      cy.get("@testComponent").invoke("attr", "partial_bookable_ratio", 1);
      cy.get("button.slot.busy").should("have.length", 92);
    });

    it("Updates mandate_top_of_hour will change availability", () => {
      cy.get('.controls input[name="mandate-top-of-hour"]').check("true");
      cy.get("button.slot.busy").should("have.length", 74);
    });

    it("Updates open_hours/Block Lunch control will change availability", () => {
      cy.get('.controls input[name="block-lunch"]').check("everyday");
      cy.get("button.slot.closed").should("have.length", 51);
    });
  });
});
