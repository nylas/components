document.addEventListener("DOMContentLoaded", function () {
  const component = document.querySelector("nylas-availability");
  const startTimeInput = document.querySelector("input#start-time");
  const endTimeInput = document.querySelector("input#end-time");
  const daysInput = document.querySelector("input#days-to-show");
  const overbookedThresholdInput = document.querySelector(
    "input#overbooked-threshold",
  );

  const event = {
    event_title: "My Demo Meeting",
    event_description: "This is an event created by a demo app!",
    slot_size: 15,
    participantEmails: ["demo@nylas.com"],
  };

  component.events = [event];
  // component.availability = availability;
  // component.booking_options = booking_options;

  component.max_book_ahead_days = 0;
  setTimeout(() => (component.max_book_ahead_days = 1), 5000);

  component.addEventListener("dateChange", (event) => {
    console.log("date change", event.detail.dates);
  });

  component.addEventListener("timeSlotChosen", (event) => {
    console.log(event.detail.timeSlots);
  });

  startTimeInput.addEventListener("input", (event) => {
    component.start_hour = parseInt(event.target.value);
  });

  endTimeInput.addEventListener("input", (event) => {
    component.end_hour = parseInt(event.target.value);
  });

  daysInput.addEventListener("input", (event) => {
    component.dates_to_show = parseInt(event.target.value);
  });

  overbookedThresholdInput.addEventListener("input", (event) => {
    component.overbooked_threshold = parseInt(event.target.value);
  });

  document.querySelectorAll('input[name="slot-size"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.slot_size = event.target.value;
    });
  });

  document.querySelectorAll('input[name="event-buffer"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.event_buffer = event.target.value;
    });
  });

  document.querySelectorAll('input[name="show-ticks"]').forEach((elem) => {
    elem.addEventListener("change", function (event) {
      component.show_ticks = JSON.parse(event.target.value);
    });
  });

  document.querySelectorAll('input[name="allow-booking"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.allow_booking = JSON.parse(event.target.value);
    });
  });

  document.querySelectorAll('input[name="show-header"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.show_header = JSON.parse(event.target.value);
    });
  });

  document.querySelectorAll('input[name="date-format"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.date_format = event.target.value;
    });
  });

  document
    .querySelectorAll('input[id="partial_bookable_ratio"]')
    .forEach((elem) => {
      elem.addEventListener("input", function (event) {
        component.partial_bookable_ratio = JSON.parse(event.target.value);
      });
    });

  document.querySelectorAll('input[name="max-book-ahead"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.max_book_ahead_days = JSON.parse(event.target.value);
    });
  });

  document.querySelectorAll('input[name="min-book-ahead"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.min_book_ahead_days = JSON.parse(event.target.value);
    });
  });

  document
    .querySelector('input[name="capacity"]')
    .addEventListener("input", (event) => {
      component.capacity = JSON.parse(event.target.value);
    });

  document.querySelectorAll('input[name="week-view"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.show_as_week = JSON.parse(event.target.value);
    });
  });

  document.querySelectorAll('input[name="show-weekends"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.show_weekends = JSON.parse(event.target.value);
    });
  });

  document
    .querySelectorAll('input[name="allow-date-change"]')
    .forEach((elem) => {
      elem.addEventListener("input", function (event) {
        component.allow_date_change = JSON.parse(event.target.value);
      });
    });

  document.querySelectorAll('input[name^="color-"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      const type = elem.getAttribute("data-type");
      component[type] = event.target.value;
    });
  });

  document.querySelectorAll('input[name="view-as"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      component.view_as = event.target.value;
    });
  });

  document.querySelectorAll('input[name="block-lunch"]').forEach((elem) => {
    elem.addEventListener("input", function (event) {
      console.log("ya", event.target.value);
      if (event.target.value === "none") {
        component.open_hours = [];
      } else if (event.target.value === "everyday") {
        component.open_hours = [
          {
            startHour: 8,
            startMinute: 0,
            endHour: 12,
            endMinute: 0,
          },
          {
            startHour: 13,
            startMinute: 0,
            endHour: 19,
            endMinute: 0,
          },
        ];
      } else if ((event.target.value = "weekdays")) {
        component.open_hours = [
          {
            startWeekday: 1,
            startHour: 0,
            startMinute: 0,
            endWeekday: 1,
            endHour: 12,
            endMinute: 0,
          },
          // Check it out: this next open_hours object spans across the midnight barrier (the rest all end at midnight)
          {
            startWeekday: 1,
            startHour: 13,
            startMinute: 0,
            endWeekday: 2,
            endHour: 12,
            endMinute: 0,
          },
          {
            startWeekday: 2,
            startHour: 13,
            startMinute: 0,
            endWeekday: 2,
            endHour: 24,
            endMinute: 0,
          },
          {
            startWeekday: 3,
            startHour: 0,
            startMinute: 0,
            endWeekday: 3,
            endHour: 12,
            endMinute: 0,
          },
          {
            startWeekday: 3,
            startHour: 13,
            startMinute: 0,
            endWeekday: 3,
            endHour: 24,
            endMinute: 0,
          },
          {
            startWeekday: 4,
            startHour: 0,
            startMinute: 0,
            endWeekday: 4,
            endHour: 12,
            endMinute: 0,
          },
          {
            startWeekday: 4,
            startHour: 13,
            startMinute: 0,
            endWeekday: 4,
            endHour: 24,
            endMinute: 0,
          },
          {
            startWeekday: 5,
            startHour: 0,
            startMinute: 0,
            endWeekday: 5,
            endHour: 12,
            endMinute: 0,
          },
          {
            startWeekday: 5,
            startHour: 13,
            startMinute: 0,
            endWeekday: 5,
            endHour: 24,
            endMinute: 0,
          },
        ];
      }
    });
  });

  document
    .querySelectorAll('input[name="mandate-top-of-hour"]')
    .forEach((elem) => {
      elem.addEventListener("input", function (event) {
        component.mandate_top_of_hour = JSON.parse(event.target.value);
      });
    });
});
