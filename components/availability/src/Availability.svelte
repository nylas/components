<svelte:options tag="nylas-availability" />

<script lang="ts">
  import {
    ManifestStore,
    AvailabilityStore,
    CalendarStore,
  } from "../../../commons/src";
  import { onMount, tick } from "svelte";
  import { get_current_component } from "svelte/internal";
  import {
    getEventDispatcher,
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";
  import type { TimeInterval } from "d3-time";
  import {
    timeSaturday,
    timeSunday,
    timeWeek,
    timeDay,
    timeHour,
    timeMinute,
  } from "d3-time";
  import { scaleTime } from "d3-scale";
  import type { CalendarQuery } from "@commons/types/Events";

  import {
    SelectionStatus,
    AvailabilityStatus,
  } from "@commons/enums/Availability";

  import type {
    Calendar,
    Manifest,
    TimeSlot,
    SelectableSlot,
    AvailabilityQuery,
    EventQuery,
    CalendarAccount,
  } from "@commons/types/Availability";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import AvailableIcon from "./assets/available.svg";
  import UnavailableIcon from "./assets/unavailable.svg";

  //#region props
  export let id: string = "";
  export let access_token: string = "";
  export let start_hour: number;
  export let end_hour: number;
  export let slot_size: number; // in minutes
  export let start_date: Date;
  export let dates_to_show: number;
  export let calendars: Calendar[];
  export let show_ticks: boolean;
  export let email_ids: string[];
  export let allow_booking: boolean;
  export let max_bookable_slots: number;
  export let partial_bookable_ratio: number;
  export let show_as_week: boolean;
  export let show_weekends: boolean;
  export let attendees_to_show: number;
  export let allow_date_change: boolean;
  //#endregion props

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  $: calendarID = "";
  onMount(async () => {
    await tick();
    clientHeight = main?.getBoundingClientRect().height;
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};

    internalProps = buildInternalProps($$props, manifest) as Partial<Manifest>;

    const calendarQuery: CalendarQuery = {
      access_token,
      component_id: id,
      calendarIDs: [], // empty array will fetch all calendars
    };
    const calendarsList = await CalendarStore.getCalendars(calendarQuery); // TODO: we probably dont want to expose a list of all a users calendars to the end-user here.
    calendarID = calendarsList?.find((cal) => cal.is_primary)?.id || "";
  });

  $: {
    const rebuiltProps = buildInternalProps(
      $$props,
      manifest,
    ) as Partial<Manifest>;
    if (JSON.stringify(rebuiltProps) !== JSON.stringify(internalProps)) {
      internalProps = rebuiltProps;
    }
  }

  $: {
    start_hour = getPropertyValue(internalProps.start_hour, start_hour, 0);
    end_hour = getPropertyValue(internalProps.end_hour, end_hour, 24);
    slot_size = getPropertyValue(internalProps.slot_size, slot_size, 15);
    start_date = getPropertyValue(
      internalProps.start_date,
      start_date,
      new Date(),
    );
    dates_to_show = getPropertyValue(
      internalProps.dates_to_show,
      dates_to_show,
      1,
    );
    calendars = getPropertyValue(internalProps.calendars, calendars, []);
    show_ticks = getPropertyValue(internalProps.show_ticks, show_ticks, true);
    email_ids = getPropertyValue(internalProps.email_ids, email_ids, []);
    allow_booking = getPropertyValue(
      internalProps.allow_booking,
      allow_booking,
      false,
    );
    max_bookable_slots = getPropertyValue(
      internalProps.max_bookable_slots,
      max_bookable_slots,
      1,
    );
    partial_bookable_ratio = getPropertyValue(
      internalProps.partial_bookable_ratio,
      partial_bookable_ratio,
      0,
    );
    show_as_week = getPropertyValue(
      internalProps.show_as_week,
      show_as_week,
      false,
    );
    show_weekends = getPropertyValue(
      internalProps.show_weekends,
      show_weekends,
      true,
    );
    attendees_to_show = getPropertyValue(
      internalProps.attendees_to_show,
      attendees_to_show,
      5,
    );
    allow_date_change = getPropertyValue(
      internalProps.allow_date_change,
      allow_date_change,
      true,
    );
  }

  //#endregion mount and prop initialization

  const dispatchEvent = getEventDispatcher(get_current_component());

  //#region layout
  let main: HTMLElement;
  let tickContainer: HTMLElement;
  let clientHeight: number;

  $: datesToShow = dates_to_show;

  // We should always show a consistent number of date columns; if weekends are off, show the next N dates that would otherwise by shown.
  // In practice: dates_to_show = 4 + !show_weekends + <today being thursday> will show Thurs, Fri, Mon, Tues.
  // Without this reactive block, it would just show Thurs, Fri.
  $: {
    if (datesToShow && !show_weekends) {
      let weekendDates = scaleTime()
        .domain([startDay, timeDay.offset(start_date, dates_to_show - 1)])
        .ticks(timeDay)
        .filter((date) => date.getDay() === 6 || date.getDay() === 0);

      // console.log(
      //   "midway check",
      //   start_date,
      //   dates_to_show,
      //   timeDay.offset(start_date, dates_to_show - 1),
      // );

      // The above fails in the following case:
      // dates_to_show = 1
      // !show_weekends
      // current date is a sturday
      // It'll try to bump the date by 1, which is a Sunday. Let's bump it one further if that's the case.
      if (weekendDates[weekendDates.length - 1]?.getDay() === 6) {
        console.log("YES, the LAST DAY TO SHOW is SATURDAY");
        datesToShow = dates_to_show + weekendDates.length + 1;
      } else {
        console.log("NO, NOT THE CASE");
        datesToShow = dates_to_show + weekendDates.length;
      }
      console.log(
        "reactive calc",
        startDay,
        dates_to_show,
        datesToShow,
        weekendDates,
      );
    } else {
      datesToShow = dates_to_show;
    }
  }

  $: console.log("----", days[0].timestamp);

  // You can have as few as 1, and as many as 7, days shown
  // start_date dates_to_show gets overruled by show_as_week (always shows 5 or 7 dates that include your start_date instead)
  let startDay: Date;
  let endDay: Date;
  $: startDay = show_as_week
    ? timeWeek.floor(start_date)
    : timeDay.floor(start_date);
  $: endDay = show_as_week
    ? timeDay.offset(startDay, 6)
    : timeDay.offset(start_date, datesToShow - 1);

  // map over the ticks() of the time scale between your start day and end day
  // populate them with as many slots as your start_hour, end_hour, and slot_size dictate
  $: generateDaySlots = function (
    timestamp: Date,
    start_hour: number,
    end_hour: number,
  ) {
    const dayStart = timeHour(
      new Date(new Date(timestamp).setHours(start_hour)),
    );
    const dayEnd = timeHour(new Date(new Date(timestamp).setHours(end_hour)));
    return scaleTime()
      .domain([dayStart, dayEnd])
      .ticks(timeMinute.every(slot_size) as TimeInterval)
      .slice(0, -1) // dont show the 25th hour
      .map((time: Date) => {
        const endTime = timeMinute.offset(time, slot_size);
        const freeCalendars: string[] = [];
        let availability = AvailabilityStatus.FREE; // default
        if (allCalendars.length) {
          for (const calendar of allCalendars) {
            let availabilityExistsInSlot = calendar.timeslots.some(
              (block) => time < block.end_time && block.start_time < endTime,
            );
            if (calendar.availability === AvailabilityStatus.BUSY) {
              if (!availabilityExistsInSlot) {
                freeCalendars.push(calendar?.account?.emailAddress || "");
              }
            } else if (
              calendar.availability === AvailabilityStatus.FREE ||
              !calendar.availability
            ) {
              // if a calendar is passed in without availability, assume the timeslots are available.
              if (availabilityExistsInSlot) {
                freeCalendars.push(calendar?.account?.emailAddress || "");
              }
            }
          }
        }

        if (allCalendars.length) {
          if (freeCalendars.length) {
            if (freeCalendars.length === allCalendars.length) {
              availability = AvailabilityStatus.FREE;
            } else {
              availability = AvailabilityStatus.PARTIAL;
            }
          } else {
            availability = AvailabilityStatus.BUSY;
          }
        }

        if (
          availability === AvailabilityStatus.PARTIAL &&
          freeCalendars.length < allCalendars.length * partial_bookable_ratio
        ) {
          availability = AvailabilityStatus.BUSY;
        }

        return {
          selectionStatus: SelectionStatus.UNSELECTED,
          calendar_id: calendarID,
          availability: availability,
          available_calendars: freeCalendars,
          start_time: time,
          end_time: endTime,
        };
      });
  };

  let ticks: Date[] = [];

  const minimumTickHeight = 30; // minimum pixels between ticks, vertically
  const slotSizes = [15, 30, 60, 180, 360]; // we only want to show ticks in intervals of 15 mins, 30 mins, 60 mins, 3 hours, or 6 hours.

  $: ticks = generateTicks(
    clientHeight,
    days[0].slots.map((slot: TimeSlot) => slot.start_time),
  );

  // We don't want to show all 96 15-minute intervals unless the user has a real tall screen.
  // So let's be smart about it and filter on modification of start_time, end_time, slot_size, or clientHeight
  // generateTicks() is a recursive func that retries if a minimumTickHeight threshold is not met
  // Calculation goal of < 5ms -- console.timers kept in place for future development testing.
  const generateTicks = (
    height: number,
    ticks: Date[],
    intervalCounter: number = 0,
  ): Date[] => {
    // console.time('ticks')
    const tickIters = slotSizes[intervalCounter];

    // ternary here because timeMinute.every(120) doesnt work, but timeHour.every(2) does.
    let timeInterval =
      tickIters > 60
        ? timeHour.every(tickIters / 60)
        : timeMinute.every(tickIters);

    ticks = scaleTime()
      .domain(ticks)
      .ticks(timeInterval as TimeInterval);

    const averageTickHeight = height / ticks.length;

    if (
      tickIters < slot_size || // dont show 15-min ticks if slot size is hourly
      (averageTickHeight < minimumTickHeight && // make sure ticks're at least yea-pixels tall
        intervalCounter < slotSizes.length) // don't try to keep going if youve reached every 6 hours. Subdividing a day into fewer than 4 parts doesn't yield a nice result.
    ) {
      return generateTicks(height, ticks, intervalCounter + 1);
    } else {
      // console.timeEnd('ticks')
      return ticks;
    }
  };

  // Consecutive same-availability periods of time, from earliest start_time to latest end_time.
  function generateEpochs(
    slots: SelectableSlot[],
    partial_bookable_ratio: number,
  ) {
    const epochScale = scaleTime().domain([
      slots[0].start_time,
      slots[slots.length - 1].end_time,
    ]);
    let epochs = slots
      .reduce((epochList, slot) => {
        const prevEpoch = epochList[epochList.length - 1];
        // Edge case note: available_calendars is doing a stringified array compare,
        // which means if they're differently ordered but otherwise teh same, this will fail.
        if (
          prevEpoch &&
          JSON.stringify(prevEpoch[0].available_calendars) ===
            JSON.stringify(slot.available_calendars)
        ) {
          prevEpoch.push(slot);
        } else {
          epochList.push([slot]);
        }
        return epochList;
      }, [] as TimeSlot[][])
      .map((epoch) => {
        let status = "free";
        const numFreeCalendars = epoch[0].available_calendars.length;
        if (
          numFreeCalendars === 0 ||
          (numFreeCalendars !== allCalendars.length &&
            numFreeCalendars < allCalendars.length * partial_bookable_ratio)
        ) {
          status = "busy";
        } else if (
          numFreeCalendars > 0 &&
          numFreeCalendars !== allCalendars.length
        ) {
          status = "partial";
        }
        return {
          start_time: epoch[0].start_time,
          offset: epochScale(epoch[0].start_time) * 100,
          status,
          height:
            (epochScale(epoch[epoch.length - 1].end_time) -
              epochScale(epoch[0].start_time)) *
            100,
          end_time: epoch[epoch.length - 1].end_time,
          slots: epoch.length,
          available_calendars: epoch[0].available_calendars,
        };
      });
    return epochs;
  }

  $: days = scaleTime()
    .domain([startDay, endDay])
    .ticks(timeDay)
    .filter((timestamp: Date) => {
      if (show_weekends) {
        return true;
      } else {
        return (
          timestamp.toString() !== timeSaturday(timestamp).toString() &&
          timestamp.toString() !== timeSunday(timestamp).toString()
        );
      }
    })
    .map((timestamp: Date) => {
      let slots = generateDaySlots(timestamp, start_hour, end_hour);
      return {
        slots,
        epochs: generateEpochs(slots, partial_bookable_ratio),
        timestamp,
      };
    });
  //#endregion layout

  // #region timeSlot selection
  let slotSelection: SelectableSlot[] = [];
  let sortedSlots: SelectableSlot[] = [];
  $: slotSelection = days
    .map((day) =>
      day.slots.filter(
        (slot) => slot.selectionStatus === SelectionStatus.SELECTED,
      ),
    )
    .flat();

  $: sortedSlots = slotSelection
    .sort((a, b) => a.start_time.getTime() - b.start_time.getTime())
    .reduce((slotList, slot) => {
      const prevSlot = slotList[slotList.length - 1];
      if (
        prevSlot &&
        slot.start_time.getTime() === prevSlot.end_time.getTime()
      ) {
        prevSlot.end_time = slot.end_time;
      } else {
        slotList.push({ ...slot });
      }
      return slotList;
    }, [] as SelectableSlot[]);

  $: if (sortedSlots.length) {
    dispatchEvent("timeSlotChosen", { timeSlots: sortedSlots });
  }
  // #endregion timeSlot selection

  $: newCalendarTimeslotsForGivenEmails = [];

  $: allCalendars = [
    // TODO: consider merging these 2 into just calendars
    ...calendars,
    ...newCalendarTimeslotsForGivenEmails,
  ];

  let availabilityQuery: AvailabilityQuery;

  $: (async () => {
    if (email_ids?.length) {
      newCalendarTimeslotsForGivenEmails = await getAvailability();
    }
    // When dates_to_show is updated, update availability
    if (email_ids?.length && dates_to_show && show_as_week !== undefined) {
      newCalendarTimeslotsForGivenEmails = await getAvailability();
    }
  })();

  async function getAvailability() {
    let freeBusyCalendars: any = [];
    availabilityQuery = {
      body: {
        emails: email_ids,
        start_time:
          new Date(new Date(startDay).setHours(start_hour)).getTime() / 1000,
        end_time:
          new Date(new Date(endDay).setHours(end_hour)).getTime() / 1000,
      },
      component_id: id,
      access_token: access_token,
    };
    // Free-Busy endpoint returns busy timeslots for given email_ids between start_time & end_time
    const consolidatedAvailabilityForGivenDay = await AvailabilityStore.getAvailability(
      availabilityQuery,
    );
    if (consolidatedAvailabilityForGivenDay?.length) {
      consolidatedAvailabilityForGivenDay.forEach((user) => {
        freeBusyCalendars.push({
          emailAddress: user.email,
          account: {
            emailAddress: user.email, // ¯\_(ツ)_/¯
          },
          availability: AvailabilityStatus.BUSY,
          timeslots: user.time_slots.map((_slot) => ({
            start_time: new Date(_slot.start_time * 1000),
            end_time: new Date(_slot.end_time * 1000),
          })),
        });
      });
    }
    return freeBusyCalendars;
  }
  //#region event query
  let query: EventQuery;
  $: query = {
    component_id: id,
    access_token: access_token,
    calendar_id: "",
    participants: [{ email_address: "" }],
  };
  //#endregion event query

  //#region Attendee Overlay
  let attendeeOverlay: HTMLElement;
  let selectedAttendees: (CalendarAccount & { isAvailable: boolean })[] = [];
  let displayedAttendees: (CalendarAccount & { isAvailable: boolean })[] = [];

  function showOverlay(event: Event, epoch: any) {
    const epochElement: HTMLElement | null = (<HTMLElement>(
      event.target
    )).closest(".epoch");

    const epochContainer: HTMLElement | null = (<HTMLElement>(
      event.target
    )).closest(".epochs");

    if (!epochElement || !epochContainer || !attendeeOverlay) {
      return;
    }

    selectedAttendees = allCalendars
      .map((calendar) => ({
        ...calendar.account,
        given_name: calendar.account?.firstName,
        surname: calendar.account?.lastName,
        isAvailable: !!epoch.available_calendars.find(
          (email: string) => email === calendar?.account?.emailAddress,
        ),
      }))
      .sort((a, b) => {
        if (a.isAvailable === b.isAvailable) {
          return a.emailAddress.localeCompare(b.emailAddress);
        } else if (a.isAvailable) {
          return -1;
        } else {
          return 1;
        }
      });

    // Only show up to attendees_to_show attendees
    if (attendees_to_show > 0) {
      displayedAttendees = selectedAttendees.slice(0, attendees_to_show);
    }

    const tickContainerDimensions = tickContainer.getBoundingClientRect(),
      targetElemDimensions = (<HTMLElement>(
        event.target
      )).getBoundingClientRect();

    attendeeOverlay.style.left = `${
      targetElemDimensions.left -
      targetElemDimensions.width / 2 -
      (tickContainerDimensions.left + tickContainerDimensions.width)
    }px`;

    attendeeOverlay.style.top = `${
      epochElement.offsetTop +
      epochContainer.offsetTop +
      (<HTMLElement>event.target).offsetHeight +
      (<HTMLElement>event.target).offsetTop +
      5
    }px`;
    attendeeOverlay.style.display = "block";
  }

  // Invert overlay position if it would overflow the bottom of the component
  $: (async () => {
    // Wait a tick to ensure the overlay height has been calculated correctly
    await tick();
    const mainDimensions = main?.getBoundingClientRect(),
      overlayDimensions = attendeeOverlay?.getBoundingClientRect();

    if (overlayDimensions?.bottom > mainDimensions?.bottom) {
      attendeeOverlay.style.top = `${
        attendeeOverlay.offsetTop - attendeeOverlay.offsetHeight - 30
      }px`;
      attendeeOverlay.classList.add("invert-y");
    }
  })();

  function hideOverlay() {
    if (attendeeOverlay) {
      attendeeOverlay.style.display = "none";
      attendeeOverlay.classList.remove("invert-y");
    }
  }

  function getAttendeeClass(attendee: any, idx: number): string {
    const classes = ["contact"];
    if (!attendee.isAvailable) {
      classes.push("unavailable");
    }
    if (idx !== displayedAttendees.length - 1) {
      classes.push("divider");
    }
    return classes.join(" ");
  }
  //#endregion Attendee Overlay

  // #region Date Change
  function goToNextDate() {
    // console.log(
    //   { start_date },
    //   { startDay },
    //   { datesToShow },
    //   { show_as_week },
    // );
    if (!show_as_week) {
      start_date = timeDay.offset(start_date, datesToShow);
      // console.log("so start date becomes", start_date);
    }
  }
  function goToPreviousDate() {
    console.log("lol");
  }
  // #endregion Date Change
</script>

<style lang="scss">
  @import "../../theming/variables.scss";
  $headerHeight: 40px;
  $color-free: rgba(54, 210, 173, 0.4);
  $color-busy: rgba(255, 100, 117, 0.4);
  $color-partial: rgba(255, 255, 117, 0.4);
  main {
    height: 100%;
    overflow: hidden;
    display: grid;
    font-family: Arial, Helvetica, sans-serif;
    position: relative;
    z-index: 1;

    &.ticked {
      grid-template-columns: auto 1fr;
    }

    &.dated {
      grid-template-rows: auto 1fr;
      header {
        grid-column: -1 / 1;
      }
    }

    .days {
      display: grid;
      gap: 0.25rem;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
    }

    .ticks {
      display: grid;
      grid-auto-flow: row;
      grid-auto-rows: auto;
      height: calc(100% - #{$headerHeight});
      list-style-type: none;
      margin: 0;
      padding: 0;
      overflow: hidden;
      padding-top: $headerHeight;
      font-size: 0.8rem;
      font-family: sans-serif;
      // text-align: right;

      li {
        display: block;
        position: relative;
        height: auto;
        overflow: hidden;
        padding: 0 0.25rem;
        display: grid;
        // align-content: center;
        justify-content: right;
      }
    }

    .day {
      display: grid;
      grid-template-rows: $headerHeight 1fr;
      position: relative;

      h2 {
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem;
        height: 30px;
        line-height: 1.875;
        font-size: 1rem;
        font-weight: 300;

        .date {
          border-radius: 15px;
          background: var(--blue);
          color: white;
          font-weight: bold;
          display: block;
          width: 30px;
          height: 30px;
          line-height: 1.875;
          text-align: center;
        }
      }

      .epochs {
        position: absolute;
        top: $headerHeight;
        width: 100%;
        height: calc(100% - #{$headerHeight});
        background: rgba(255, 255, 255, 0);
        .epoch {
          position: absolute;
          width: 100%;

          .inner {
            margin: 0rem;
            height: calc(100% - 0.5rem);
            overflow: hidden;
            padding: 0.25rem;
          }

          &.busy .inner {
            background-color: $color-busy;
          }
          &.partial .inner {
            background-color: $color-partial;
          }

          &.free .inner {
            background-color: $color-free;
          }

          .available-calendars {
            display: inline-block;
            position: relative;
            z-index: 2;

            span {
              background: rgba(0, 0, 0, 0.5);
              display: inline-block;
              margin: 0.25rem;
              padding: 0.25rem;
              font-size: 0.7rem;
              color: white;
            }
          }
        }
      }

      .slots {
        display: grid;
        grid-auto-flow: row;
        grid-auto-rows: auto;
        height: 100%;
        list-style-type: none;
        margin: 0;
        padding: 0;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom: none;

        .slot {
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: transparent;
          position: relative;
          align-items: center;
          justify-content: center;
          align-content: center;
          font-family: sans-serif;

          &.selected {
            background-color: purple;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
          }

          &.busy {
            cursor: not-allowed;
          }
        }
      }
    }
    button.confirm {
      grid-column: -1 / 1;
    }

    &.allow_booking {
      .slot:not(.busy):hover,
      .slot:not(.busy):focus {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
        cursor: pointer;
      }
    }

    .attendee-overlay {
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 4px 14px 0 black;
      display: none;
      font-size: 14px;
      max-width: 12rem;
      padding: 1.2rem 1rem;
      position: absolute;
      z-index: 3;

      &::before {
        content: "";
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid white;
        position: absolute;
        left: 5.5rem;
        top: -10px;
      }

      &.invert-y {
        &::before {
          display: none;
        }

        &::after {
          content: "";
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid white;
          position: absolute;
          left: 5.5rem;
          bottom: -10px;
        }
      }

      .attendee-list {
        .contact {
          display: grid;
          grid-template-columns: 40px auto;
          padding: 0.6rem 0;

          &.divider {
            border-bottom: 1px solid #979797;
          }

          &.unavailable {
            filter: grayscale(80%);
            opacity: 50%;
          }

          .default-avatar {
            background: #002db4;
            border-radius: 50%;
            color: #fff;
            font-family: sans-serif;
            font-size: 1rem;
            font-weight: bold;
            height: 32px;
            line-height: 35px;
            text-align: center;
            text-transform: uppercase;
            width: 32px;
          }

          .contact-details {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .name {
              font-weight: bold;
              display: block;
            }
          }
        }
        .icon {
          position: relative;
          top: -1.3rem;
          left: 1.2rem;
          height: 0;
          width: 0;
        }
      }
      .more-attendees {
        font-weight: bold;
        display: inline-block;
        padding-top: 1rem;
      }
    }
  }
</style>

<nylas-error {id} />
<main
  bind:this={main}
  bind:clientHeight
  class:ticked={show_ticks}
  class:dated={allow_date_change}
  class:allow_booking
>
  {#if allow_date_change}
    <header class="change-dates">
      <button on:click={goToPreviousDate} aria-label="Previous date">‹</button>
      <button on:click={goToNextDate} aria-label="Next date">›</button>
    </header>
  {/if}
  {#if show_ticks}
    <ul class="ticks" bind:this={tickContainer}>
      {#each ticks as tick}
        <li class="tick">
          {tick.toLocaleTimeString("default", {
            hour: "numeric",
            minute: "numeric",
          })}
        </li>
      {/each}
    </ul>
  {/if}
  <div class="days">
    {#each days as day}
      <div class="day">
        <header>
          <h2>
            <span class="date">
              {new Date(day.timestamp).toLocaleString("default", {
                day: "numeric",
              })}
            </span>
            <span>
              {new Date(day.timestamp).toLocaleString("default", {
                weekday: "long",
              })}
            </span>
          </h2>
        </header>
        <div class="epochs">
          {#each day.epochs as epoch}
            <div
              class="epoch {epoch.status}"
              style="height: {epoch.height}%; top: {epoch.offset}%;"
              data-available-calendars={epoch.available_calendars.toString()}
              data-start-time={new Date(epoch.start_time).toLocaleString()}
              data-end-time={new Date(epoch.end_time).toLocaleString()}
            >
              <div class="inner">
                <div class="available-calendars">
                  <span
                    on:mouseenter={(event) => showOverlay(event, epoch)}
                    on:mouseleave={hideOverlay}
                  >
                    {epoch.available_calendars.length} of {allCalendars.length}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <div class="slots">
          {#each day.slots as slot}
            <button
              data-available-calendars={slot.available_calendars.toString()}
              aria-label="{new Date(
                slot.start_time,
              ).toLocaleString()} to {new Date(
                slot.end_time,
              ).toLocaleString()}}; Free calendars: {slot.available_calendars.toString()}"
              class="slot {slot.selectionStatus} {slot.availability}"
              data-start-time={new Date(slot.start_time).toLocaleString()}
              data-end-time={new Date(slot.end_time).toLocaleString()}
              disabled={slot.availability === AvailabilityStatus.BUSY}
              on:click={() => {
                if (allow_booking) {
                  slot.selectionStatus =
                    slot.selectionStatus === SelectionStatus.SELECTED
                      ? SelectionStatus.UNSELECTED
                      : slotSelection.length < max_bookable_slots
                      ? SelectionStatus.SELECTED
                      : SelectionStatus.UNSELECTED;
                }
              }}
            />
          {/each}
        </div>
      </div>
    {/each}
  </div>
  <div class="attendee-overlay" bind:this={attendeeOverlay}>
    <span>
      {selectedAttendees.filter((attendee) => attendee.isAvailable).length} of {allCalendars.length}
    </span>
    <div class="attendee-list">
      {#each displayedAttendees as attendee, idx}
        <div class={getAttendeeClass(attendee, idx)}>
          <div class="default-avatar">
            <nylas-contact-image contact={attendee} />
          </div>
          <div class="contact-details">
            <span class="name">
              {`${attendee.firstName} ${attendee.lastName}`}
            </span>
            <span class="email">{attendee.emailAddress}</span>
          </div>
        </div>
        <div class="icon">
          {#if attendee.isAvailable}
            <AvailableIcon />
          {:else}
            <UnavailableIcon />
          {/if}
        </div>
      {/each}
      {#if selectedAttendees.length > attendees_to_show}
        <span class="more-attendees">
          {`+${selectedAttendees.length - attendees_to_show} more`}
        </span>
      {/if}
    </div>
  </div>
</main>
