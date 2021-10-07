<svelte:options tag="nylas-availability" />

<script lang="ts">
  import {
    ManifestStore,
    AvailabilityStore,
    CalendarStore,
    ErrorStore,
  } from "../../../commons/src";
  import { handleError } from "@commons/methods/api";
  import { onMount, tick } from "svelte";
  import { get_current_component } from "svelte/internal";
  import {
    getEventDispatcher,
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";
  import type { TimeInterval } from "d3-time";
  import { timeWeek, timeDay, timeHour, timeMinute } from "d3-time";
  import { scaleTime } from "d3-scale";
  import type { CalendarQuery } from "@commons/types/Events";

  import { lightenHexColour } from "@commons/methods/colour";

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
    CalendarAccount,
    AvailabilityRule,
  } from "@commons/types/Availability";
  import type { Manifest as EditorManifest } from "@commons/types/ScheduleEditor";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import "@commons/components/ErrorMessage.svelte";
  import AvailableIcon from "./assets/available.svg";
  import UnavailableIcon from "./assets/unavailable.svg";
  import BackIcon from "./assets/left-arrow.svg";
  import NextIcon from "./assets/right-arrow.svg";

  //#region props
  export let id: string = "";
  export let access_token: string = "";
  export let editor_id: string;
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
  export let required_participants: string[];
  export let busy_color: string;
  export let closed_color: string;
  export let partial_color: string;
  export let free_color: string;
  export let selected_color: string;
  export let show_hosts: "show" | "hide";
  export let view_as: "schedule" | "list";
  export let event_buffer: number;
  export let capacity: number | null;
  export let show_header: boolean;
  export let date_format: "weekday" | "date" | "full" | "none";
  export let open_hours: AvailabilityRule[];
  export let overbooked_threshold: number;
  export let mandate_top_of_hour: boolean;

  $: hasError = Object.keys($ErrorStore).length ? true : false;
  /**
   * Re-loads availability data from the Nylas API.
   * @param {boolean} clearSelection Used to indicate whether any currently selected timeslots should be cleared. Defaults to false.
   * @param {boolean} slotsBooked Used to indicate whether the component should assume the previously selected slots were booked. Defaults to false.
   */
  export async function reload(clearSelection = false, slotsBooked = false) {
    if (slotsBooked) {
      const selectedSlots: any = [];
      for (const day of days) {
        selectedSlots.push(
          ...day?.slots
            .filter(
              (slot: any) => slot.selectionStatus === SelectionStatus.SELECTED,
            )
            .map((slot: any) => ({
              status: "busy",
              start_time: new Date(slot.start_time).getTime() / 1000,
              end_time: new Date(slot.end_time).getTime() / 1000,
            })),
        );
      }

      $AvailabilityStore[JSON.stringify(availabilityQuery)] =
        $AvailabilityStore[JSON.stringify(availabilityQuery)].then(
          (availability) => {
            for (const calendar of availability) {
              calendar.time_slots.push(...selectedSlots);
            }
            return availability;
          },
        );

      await getAvailability();
    }

    if (clearSelection && Array.isArray(days)) {
      for (const day of days) {
        for (const slot of day.slots) {
          slot.selectionStatus = SelectionStatus.UNSELECTED;
        }
      }
      days = [...days];
    }

    await getAvailability(true);
  }

  //#endregion props

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  let editorManifest: Partial<EditorManifest> = {};
  let loading: boolean;

  $: calendarID = "";
  onMount(async () => {
    await tick();
    loading = true;
    clientHeight = main?.getBoundingClientRect().height;
    dayContainerWidth = main?.getBoundingClientRect().height;
    const storeKey = JSON.stringify({
      component_id: id,
      access_token,
      external_manifest_ids: [editor_id],
    });
    manifest = (await $ManifestStore[storeKey]) || {};

    internalProps = buildInternalProps($$props, manifest) as Partial<Manifest>;

    const calendarQuery: CalendarQuery = {
      access_token,
      component_id: id,
      calendarIDs: [], // empty array will fetch all calendars
    };
    const calendarsList = await CalendarStore.getCalendars(calendarQuery); // TODO: we probably dont want to expose a list of all a users calendars to the end-user here.
    loading = false;
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
      0.01,
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
    required_participants = getPropertyValue(
      internalProps.required_participants,
      required_participants,
      [],
    );
    busy_color = getPropertyValue(
      internalProps.busy_color,
      busy_color,
      "#EE3248cc",
    );
    closed_color = getPropertyValue(
      internalProps.closed_color,
      closed_color,
      "#EE3248cc",
    );
    partial_color = getPropertyValue(
      internalProps.partial_color,
      partial_color,
      "#FECA7Ccc",
    );
    free_color = getPropertyValue(
      internalProps.free_color,
      free_color,
      "#078351cc",
    );
    selected_color = getPropertyValue(
      internalProps.selected_color,
      selected_color,
      "#002db4",
    );
    show_hosts = getPropertyValue(
      internalProps.show_hosts || editorManifest.show_hosts,
      show_hosts,
      "show",
    );
    view_as = getPropertyValue(
      internalProps.view_as || editorManifest.view_as,
      view_as,
      "schedule",
    );
    event_buffer = getPropertyValue(
      internalProps.event_buffer || editorManifest.event_buffer,
      event_buffer,
      0,
    );
    capacity = getPropertyValue(
      internalProps.capacity || editorManifest.capacity,
      capacity,
      null,
    );
    show_header = getPropertyValue(
      internalProps.show_header,
      show_header,
      true,
    );
    date_format = getPropertyValue(
      internalProps.date_format,
      date_format,
      "full",
    );
    open_hours = getPropertyValue(internalProps.open_hours, open_hours, []);
    overbooked_threshold = getPropertyValue(
      internalProps.overbooked_threshold || editorManifest.overbooked_threshold,
      overbooked_threshold,
      100,
    );
    mandate_top_of_hour = getPropertyValue(
      internalProps.mandate_top_of_hour || editorManifest.mandate_top_of_hour,
      mandate_top_of_hour,
      false,
    );
  }
  $: {
    if (
      $$props.hasOwnProperty("start_date") &&
      $$props.start_date !== startDate
    ) {
      startDate = getPropertyValue(
        internalProps.start_date,
        new Date(),
        new Date(),
      );
    } else if (!startDate) {
      startDate = start_date;
    }
  }

  //#endregion mount and prop initialization

  const dispatchEvent = getEventDispatcher(get_current_component());

  //#region layout

  let main: HTMLElement;
  let tickContainer: HTMLElement;
  let dayContainer: HTMLElement;
  let dayContainerWidth: number = 0;
  let clientHeight: number;
  let slotContainer: HTMLElement;

  const MINIMUM_DAY_WIDTH = 100;

  // Internally-settable reactive-to-external-props variable
  let datesToShow: number;

  $: optimalDatesToShow =
    Math.floor(dayContainerWidth / MINIMUM_DAY_WIDTH) || 1;
  $: datesToShow =
    optimalDatesToShow < dates_to_show || show_as_week
      ? optimalDatesToShow
      : dates_to_show;

  $: tooSmallForWeek = show_as_week && optimalDatesToShow < 7;

  //#endregion layout

  //#region data generation

  // You can have as few as 1, and as many as 7, days shown
  // start_date and datesToShow get overruled by show_as_week (always shows 5 or 7 dates that include your start_date instead)
  let startDay: Date; // the first day column shown; depends on show_as_week
  let endDay: Date;
  let startDate: Date; // internally-settable start_date

  $: dayRange =
    (show_weekends || !show_weekends) &&
    generateDayRange(
      startDay, // TODO: weird just to get show_weekends passed in
      show_as_week
        ? timeDay.offset(startDay, tooSmallForWeek ? datesToShow - 1 : 6)
        : timeDay.offset(startDay, datesToShow - 1),
    );

  $: startDay =
    show_as_week && !tooSmallForWeek
      ? timeWeek.floor(startDate)
      : timeDay.floor(startDate);

  $: endDay = dayRange[dayRange.length - 1];

  const allRequiredParticipantsIncluded = (calendars: string[]) => {
    return required_participants.every((participant) =>
      calendars.includes(participant),
    );
  };

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
            const slot = {
              start_time: time,
              end_time: endTime,
              available_calendars: [],
            };
            const timeslots =
              calendar.availability === AvailabilityStatus.BUSY
                ? calendar.timeslots.map((t) => ({
                    start_time: timeMinute.offset(t.start_time, -event_buffer),
                    end_time: timeMinute.offset(t.end_time, event_buffer),
                    available_calendars: t.available_calendars,
                  }))
                : calendar.timeslots;
            const slotAvailability = overlap(timeslots, slot);
            if (calendar.availability === AvailabilityStatus.BUSY) {
              if (
                capacity &&
                capacity >= 1 &&
                slotAvailability.concurrentEvents < capacity
              ) {
                freeCalendars.push(calendar?.account?.emailAddress || "");
              } else if (!slotAvailability.overlap) {
                freeCalendars.push(calendar?.account?.emailAddress || "");
              }
            } else if (
              calendar.availability === AvailabilityStatus.FREE ||
              !calendar.availability
            ) {
              // if a calendar is passed in without availability, assume the timeslots are available.
              if (slotAvailability.overlap) {
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

        // If availability is partial (not 100% of calendars), and that ratio is less than partial_bookable_ratio,
        // mark the slot as busy
        if (
          availability === AvailabilityStatus.PARTIAL &&
          freeCalendars.length < allCalendars.length * partial_bookable_ratio
        ) {
          availability = AvailabilityStatus.BUSY;
        }

        // Allows users to book over busy slots if partial_bookable_ratio is 0
        if (
          availability === AvailabilityStatus.BUSY &&
          partial_bookable_ratio === 0
        ) {
          availability = AvailabilityStatus.PARTIAL;
        }

        // If availability is partial, but a required participant is unavailble, the slot becomes Busy
        if (
          availability === AvailabilityStatus.PARTIAL &&
          required_participants.length
        ) {
          if (!allRequiredParticipantsIncluded(freeCalendars)) {
            availability = AvailabilityStatus.BUSY;
          }
        }

        // If mandate_top_of_hour, change any status to "busy" if it's not at :00
        if (mandate_top_of_hour && time.getMinutes() !== 0) {
          availability = AvailabilityStatus.BUSY;
          freeCalendars.length = 0;
        }

        // if the "open_hours" property has rules, adhere to them above any other event-based free/busy statuses
        // (Mark the slot busy if it falls outside the open_hours)
        if (open_hours.length) {
          if (availability !== AvailabilityStatus.BUSY) {
            let dayRelevantRules = [];
            dayRelevantRules = open_hours.filter(
              (rule) =>
                !rule.hasOwnProperty("startWeekday") ||
                rule.startWeekday === time.getDay() ||
                rule.endWeekday === time.getDay(),
            );
            let slotExistsInOpenHours = dayRelevantRules.some((rule, iter) => {
              let ruleStartAppliedDate = rule.hasOwnProperty("startWeekday")
                ? timeDay.offset(
                    time,
                    (rule.startWeekday as number) - time.getDay(),
                  )
                : new Date(time);
              ruleStartAppliedDate.setHours(rule.startHour);
              ruleStartAppliedDate.setMinutes(rule.startMinute);

              let ruleEndAppliedDate = rule.hasOwnProperty("startWeekday")
                ? timeDay.offset(
                    time,
                    (rule.endWeekday as number) - time.getDay(),
                  )
                : new Date(time);
              ruleEndAppliedDate.setHours(rule.endHour);
              ruleEndAppliedDate.setMinutes(rule.endMinute);

              return (
                time >= ruleStartAppliedDate && endTime <= ruleEndAppliedDate
              );
            });
            if (!slotExistsInOpenHours) {
              availability = AvailabilityStatus.CLOSED;
              freeCalendars.length = 0;
            }
          }
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
            JSON.stringify(slot.available_calendars) &&
          prevEpoch[0].availability === slot.availability
        ) {
          prevEpoch.push(slot);
        } else {
          epochList.push([slot]);
        }
        return epochList;
      }, [] as SelectableSlot[][])
      .map((epoch) => {
        let status = "free";

        const numFreeCalendars = epoch[0].available_calendars.length;
        const fewerCalendarsThanRatio =
          numFreeCalendars !== allCalendars.length &&
          numFreeCalendars < allCalendars.length * partial_bookable_ratio;

        if (
          numFreeCalendars === 0 ||
          fewerCalendarsThanRatio ||
          (required_participants.length &&
            !allRequiredParticipantsIncluded(epoch[0].available_calendars))
        ) {
          if (epoch[0].availability === AvailabilityStatus.CLOSED) {
            status = "closed";
          } else {
            status = "busy";
          }
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

  function generateDayRange(
    startDay: Date,
    endDay: Date,
    reverse?: boolean,
  ): Date[] {
    let range = scaleTime()
      .domain([startDay, endDay])
      .ticks(timeDay)
      .filter((timestamp: Date) => {
        if (show_weekends) {
          return true;
        } else {
          return timestamp.getDay() !== 6 && timestamp.getDay() !== 0;
        }
      });
    if (!show_as_week && !show_weekends) {
      if (range.length < datesToShow) {
        if (reverse) {
          return generateDayRange(timeDay.offset(startDay, -1), endDay, true);
        }
        return generateDayRange(startDay, timeDay.offset(endDay, 1));
      }
    }
    return range;
  }

  interface Day {
    slots: SelectableSlot[];
    epochs: any[]; // TODO
    timestamp: Date;
  }

  function checkOverbooked(slots: SelectableSlot[]) {
    allCalendars.forEach((calendar) => {
      let availableSlotsForCalendar = slots.filter((slot) =>
        slot.available_calendars.includes(calendar.account?.emailAddress),
      );
      if (
        slots.length - availableSlotsForCalendar.length >
        (overbooked_threshold * slots.length) / 100
      ) {
        availableSlotsForCalendar.forEach((slot) => {
          slot.available_calendars = slot.available_calendars.filter(
            (cal) => cal !== calendar.account?.emailAddress,
          );
          if (!slot.available_calendars.length) {
            // if it has no calendars available, it's busy
            slot.availability = AvailabilityStatus.BUSY;
          } else if (
            slot.availability === AvailabilityStatus.FREE &&
            slot.available_calendars.length !== allCalendars.length
          ) {
            // if it was previously free, but now lacks a calendar, it should be considered Partial.
            slot.availability = AvailabilityStatus.PARTIAL;
          }
        });
      }
    });

    return slots;
  }

  let days: Day[];
  $: days = dayRange.map((timestamp: Date) => {
    let slots = checkOverbooked(
      generateDaySlots(timestamp, start_hour, end_hour),
    ); // TODO: include other potential post-all-slots-established checks, like overbooked, in a single secondary run here.
    return {
      slots,
      epochs: generateEpochs(slots, partial_bookable_ratio),
      timestamp,
    };
  });
  //#endregion data generation

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

  let lastDispatchedSlots: SelectableSlot[];
  $: {
    // Only dispatch if there's a diff
    if (JSON.stringify(sortedSlots) !== JSON.stringify(lastDispatchedSlots)) {
      dispatchEvent("timeSlotChosen", { timeSlots: sortedSlots });
      lastDispatchedSlots = sortedSlots;
    }
  }

  // https://derickbailey.com/2015/09/07/check-for-date-range-overlap-with-javascript-arrays-sorting-and-reducing/
  function overlap(events: TimeSlot[], slot: TimeSlot) {
    return events.reduce(
      (result, current) => {
        const overlap =
          slot.start_time < current.end_time &&
          current.start_time < slot.end_time;

        if (overlap) {
          result.overlap = true;
          // store the amount of overlap
          result.concurrentEvents++;
        }
        return result;
      },
      { overlap: false, concurrentEvents: 0 },
    );
  }
  // #endregion timeSlot selection

  let availabilityQuery: AvailabilityQuery;
  $: availabilityQuery = {
    body: {
      emails: email_ids,
      start_time:
        timeHour(new Date(new Date(startDay).setHours(start_hour))).getTime() /
        1000,
      end_time:
        timeHour(new Date(new Date(endDay).setHours(end_hour))).getTime() /
        1000,
    },
    component_id: id,
    access_token: access_token,
  };

  $: newCalendarTimeslotsForGivenEmails = [];
  $: (async () => {
    if (availabilityQuery?.body?.emails?.length) {
      await getAvailability();
    }
  })();

  async function getAvailability(forceReload = false) {
    loading = true;
    let freeBusyCalendars: any = [];
    // Free-Busy endpoint returns busy timeslots for given email_ids between start_time & end_time
    const consolidatedAvailabilityForGivenDay = await $AvailabilityStore[
      JSON.stringify({ ...availabilityQuery, forceReload })
    ];
    loading = false;
    for (const user of consolidatedAvailabilityForGivenDay) {
      freeBusyCalendars.push({
        emailAddress: user.email,
        account: {
          emailAddress: user.email, // ¯\_(ツ)_/¯
        },
        availability: AvailabilityStatus.BUSY,
        timeslots: user.time_slots.map((slot) => ({
          start_time: new Date(slot.start_time * 1000),
          end_time: new Date(slot.end_time * 1000),
        })),
      });
    }
    newCalendarTimeslotsForGivenEmails = freeBusyCalendars;
  }

  // Figure out if a given TimeSlot is the first one in a pending, or selected, block.
  function getBlockTimes(slot: SelectableSlot, day: Day) {
    let slotIndex = day.slots.indexOf(slot);
    let wrappingSortedSlot = sortedSlots.find(
      (block) => block.start_time === slot.start_time,
    );
    // A slot is first in a Pending block if:
    // it's pending
    // and it's not busy
    // and either:
    // the slot immediately before it isn't pending
    // OR
    // the slot immediately before it is busy
    if (
      slot.selectionPending &&
      !(
        slot.availability === AvailabilityStatus.BUSY ||
        slot.availability === AvailabilityStatus.CLOSED
      ) &&
      (!day.slots[slotIndex - 1]?.selectionPending ||
        day.slots[slotIndex - 1]?.availability === AvailabilityStatus.BUSY ||
        day.slots[slotIndex - 1]?.availability === AvailabilityStatus.CLOSED)
    ) {
      let pendingEndTime =
        day.slots.find((daySlot) => {
          return (
            daySlot.start_time > slot.start_time &&
            (!daySlot.selectionPending ||
              daySlot.availability === AvailabilityStatus.BUSY ||
              daySlot.availability === AvailabilityStatus.CLOSED)
          );
        })?.start_time || day.slots[day.slots.length - 1].end_time;

      let startTimeString =
        slot.start_time.getMinutes() === 0
          ? slot.start_time.toLocaleTimeString([], {
              hour: "numeric",
              hour12: true,
            })
          : slot.start_time.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

      let endTimeString =
        pendingEndTime.getMinutes() === 0
          ? pendingEndTime.toLocaleTimeString([], {
              hour: "numeric",
              hour12: true,
            })
          : pendingEndTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

      return `
        ${startTimeString.replace(" AM", "am").replace(" PM", "pm")}
        - 
        ${endTimeString.replace(" AM", "am").replace(" PM", "pm")}
      `;
      // Otherwise, it's first in a selected block if its start_time matches a sortedSlot's start_time
    } else if (wrappingSortedSlot) {
      let startTime =
        wrappingSortedSlot.start_time.getMinutes() === 0
          ? wrappingSortedSlot.start_time.toLocaleTimeString([], {
              hour: "numeric",
              hour12: true,
            })
          : wrappingSortedSlot.start_time.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
      let endTime =
        wrappingSortedSlot.end_time.getMinutes() === 0
          ? wrappingSortedSlot.end_time.toLocaleTimeString([], {
              hour: "numeric",
              hour12: true,
            })
          : wrappingSortedSlot.end_time.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
      return `
      ${startTime.replace(" AM", "am").replace(" PM", "pm")} - ${endTime
        .replace(" AM", "am")
        .replace(" PM", "pm")}
      `;
    } else {
      return null;
    }
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
  $: allCalendars = [
    // TODO: consider merging these 2 into just calendars
    ...calendars,
    ...newCalendarTimeslotsForGivenEmails,
  ];

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
    if ($$props.start_date) {
      delete $$props.start_date;
    }
    if (show_as_week && !tooSmallForWeek) {
      startDate = timeWeek.offset(endDay, 1);
    } else {
      startDate = timeDay.offset(endDay, 1);
    }
  }
  function goToPreviousDate() {
    if ($$props.start_date) {
      delete $$props.start_date;
    }
    if (show_as_week && !tooSmallForWeek) {
      startDate = timeWeek.offset(startDay, -1);
    } else {
      // Can't do something as simple as `start_date = timeDay.offset(startDay, -datesToShow)` here;
      // broken case: !show_weekends, start_date = a monday, datesToShow = 3; go backwards. You'll get fri-mon-tues, rather than wed-thu-fri.
      // Instead, we generateDayRange() with reverse=true to take advance of recursive non-weekend range-making.
      let previousRange = generateDayRange(
        timeDay.offset(startDay, -datesToShow),
        timeDay.offset(endDay, -datesToShow),
        true,
      );
      startDate = previousRange[0];
    }
  }
  // #endregion Date Change

  //#region dragging

  // Click + Drag has two basic modes:
  // - when you click + drag on an available spot, it should create a new series of selected timeSlots
  // - when YOu click + drag on an already-selected spot, if should let you move that spot
  // A non-dragging click will either select the timeslot you clicked, or if it's already a selected block, delete that block.
  // Note some fun behaviour: If you drag a long event overtop a busy spot, it will automatically split it into multiple events.
  // You can set partial_bookable_ratio to 0 in order to prevent this / let you book atop busy spots.
  let mouseIsDown = false;
  let dragStartSlot: SelectableSlot | null = null;
  let dragStartDay: Day | null = null;
  let draggingExistingBlock: boolean = false;

  function unpendSlots() {
    days.forEach((day) =>
      day.slots
        .filter((slot) => slot.selectionPending)
        .forEach((slot) => {
          slot.selectionPending = false;
        }),
    );
  }

  function resetDragState() {
    unpendSlots();
    mouseIsDown = false;
    dragStartDay = null;
    dragStartSlot = null;
    draggingExistingBlock = false;
    draggedBlock = null;
  }

  // draggedBlock is a member of the SortedSlots array; it has an arbitrary number of timeSlots and is represented by a single start_time and end_time
  // draggedBlockSlots is an array of timeSlots that fall within the draggedBlock's start_time and end_time
  let draggedBlock: SelectableSlot | null = null;
  $: draggedBlockSlots = draggedBlock
    ? dragStartDay?.slots.filter(
        (slot) =>
          slot.start_time >= draggedBlock!.start_time &&
          slot.end_time <= draggedBlock!.end_time,
      )
    : [];

  function startDrag(slot: SelectableSlot, day: Day) {
    if (allow_booking) {
      // Retain the initially-clicked slot and day, so we can adjust if you've moved across dates, etc.
      dragStartSlot = slot;
      dragStartDay = day;

      if (slot.selectionStatus === SelectionStatus.SELECTED) {
        draggingExistingBlock = true;
        draggedBlock =
          sortedSlots.find(
            (block) =>
              slot.start_time >= block.start_time &&
              slot.end_time <= block.end_time,
          ) || null;
      } else if (
        slotSelection.length < max_bookable_slots &&
        slot.availability !== AvailabilityStatus.BUSY &&
        slot.availability !== AvailabilityStatus.CLOSED
      ) {
        slot.selectionPending = true;
      }
    }
  }

  function addToDrag(slot: SelectableSlot, day: Day) {
    if (mouseIsDown) {
      if (draggingExistingBlock && dragStartSlot && dragStartDay) {
        // dragStartSlot && dragStartDay are superfluous here, but type errors are thrown if we don't explicitly check for them

        // Measure the distance between where you started and where you've dragged to, vertically.
        let delta =
          day.slots.indexOf(slot) - dragStartDay.slots.indexOf(dragStartSlot);

        // Remove "pending" status from your previous location
        unpendSlots();

        draggedBlockSlots?.forEach((slot) => {
          let slotPlusDelta =
            day.slots[dragStartDay!.slots.indexOf(slot) + delta];
          if (slotPlusDelta) {
            slotPlusDelta.selectionPending = true;
          }
        });
      } else {
        // When drag-creating an event, dragging downward has different behaviour than dragging upward
        // especially when you consider max_bookable_slots
        let direction: "forward" | "backward" = "forward";

        if (allow_booking && day === dragStartDay && dragStartSlot) {
          if (slot.start_time < dragStartSlot.start_time) {
            direction = "backward";
          }

          // Mark a given slot as selectionPending=true if it falls between where we started dragging, and where we're dragging now
          day.slots.forEach((daySlot) => {
            if (
              direction === "forward"
                ? daySlot.start_time >= dragStartSlot!.start_time &&
                  daySlot.start_time <= slot.start_time
                : daySlot.start_time <= dragStartSlot!.start_time &&
                  daySlot.start_time >= slot.start_time
            ) {
              daySlot.selectionPending = !(
                daySlot.availability === AvailabilityStatus.BUSY ||
                daySlot.availability === AvailabilityStatus.CLOSED
              )
                ? true
                : false; // when you're dragging over a busy spot, don't set it to pending.
            } else {
              if (daySlot.selectionPending) {
                daySlot.selectionPending = false;
              }
            }
          });

          // Don't let the user book more slots than are allowed
          let tooManySlots =
            day.slots.filter(
              (s) =>
                s.selectionPending ||
                s.selectionStatus === SelectionStatus.SELECTED,
            ).length > max_bookable_slots;
          let pendingSlots = day.slots.filter((x) => x.selectionPending);
          if (tooManySlots) {
            let allowableSlots =
              max_bookable_slots -
              day.slots.filter(
                (x) => x.selectionStatus === SelectionStatus.SELECTED,
              ).length;
            if (direction === "forward") {
              // Only select the first N allowed slots AFTER your initially-dragegd one
              pendingSlots
                .slice(allowableSlots)
                .forEach((slot) => (slot.selectionPending = false));
            } else {
              // Only select the first N allowed slots BEFORE your initially-dragegd one
              pendingSlots
                .slice(0, -allowableSlots)
                .forEach((slot) => (slot.selectionPending = false));
            }
          }
        }
      }
      days = [...days]; // re-render
    }
  }

  function endDrag(slot: SelectableSlot | null, day: Day | null) {
    // Mode: Drag-moving an existing block
    if (draggingExistingBlock) {
      if (day) {
        // day is optional; endDrag with no "day" passed means user left the canvas / we should un-pend and reset our initially-dragged event

        // Set all slots in our initially dragged block to unselected
        draggedBlockSlots?.forEach(
          (slot) => (slot.selectionStatus = SelectionStatus.UNSELECTED),
        );

        // Set all our pending slots to Selected
        // (This is effectively the "Move" function)
        days.forEach((day) =>
          day.slots
            .filter((x) => x.selectionPending)
            .forEach((x) => {
              if (
                !(
                  x.availability === AvailabilityStatus.BUSY ||
                  x.availability === AvailabilityStatus.CLOSED
                )
              ) {
                x.selectionStatus = SelectionStatus.SELECTED;
              }
            }),
        );
      }
    } else {
      // Mode: Drag-mreating a new event
      days.forEach((day) =>
        day.slots
          .filter((x) => x.selectionPending)
          .forEach((x) => {
            x.selectionStatus = SelectionStatus.SELECTED;
          }),
      );
    }
    days = [...days]; // re-render
    resetDragState();
  }

  // Click action for un-draggable slot-list buttons (list view)
  function toggleSlot(slot: SelectableSlot) {
    if (slot.selectionStatus === SelectionStatus.SELECTED) {
      slot.selectionStatus = SelectionStatus.UNSELECTED;
    } else if (slotSelection.length < max_bookable_slots) {
      slot.selectionStatus = SelectionStatus.SELECTED;
    }
    days = [...days];
  }

  //#endregion dragging
  // #region error
  $: if (id && email_ids.length && capacity) {
    try {
      handleError(id, {
        name: "IncompatibleProperties",
        message:
          "Setting `capacity` currently does not work with `email_ids`. Please use `calendars` to use `capacity`.",
      });
    } catch (error) {
      console.error(error);
    }
  } else if (capacity && capacity < 1) {
    try {
      handleError(id, {
        name: "IncompatibleProperties",
        message: "`capacity` must be an integer of 1 or more",
      });
    } catch (error) {
      console.error(error);
    }
  }
  // #endregion error
</script>

<style lang="scss">
  @import "../../theming/reset.scss";
  @import "../../theming/variables.scss";
  @import "../../theming/animation.scss";

  $headerHeight: 40px;
  main {
    height: 100%;
    overflow: hidden;
    display: grid;
    font-family: Arial, Helvetica, sans-serif;
    position: relative;
    z-index: 1;
    grid-template-rows: auto 1fr;
    gap: 1rem;

    &.ticked {
      grid-template-columns: 70px 1fr;
    }

    &.hide-header {
      $headerHeight: 0px;
      grid-template-rows: auto;

      & > header {
        display: none;
      }
    }

    & > header {
      grid-column: -1 / 1;
      display: grid;
      grid-template-columns: 1fr;
      align-items: baseline;

      &.dated {
        grid-template-columns: 1fr auto;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 700;
      }

      .change-dates {
        // grid-column: -1 / 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        button {
          background-color: #f7f7f8;
          border: 1px solid #e3e8ee;
          cursor: pointer;
          display: flex;
          &:hover {
            background-color: #e3e8ee;
          }
        }
      }

      .legend {
        padding: 0.5rem 0 0;
        color: #636671;
        span {
          display: inline-block;
          margin-right: 1rem;
          &::before {
            content: "";
            border-radius: 8px;
            height: 12px;
            width: 12px;
            margin-right: 0.25rem;
            display: inline-block;
            background-color: black;
          }

          &.available::before {
            background-color: var(--free-color, #36d2addf);
          }
          &.not-available::before {
            background-color: var(--busy-color, #36d2addf);
          }
          &.closed::before {
            background-color: var(--closed-color, #999);
          }
          &.partially-available::before {
            background-color: var(--partial-color, #ffff7566);
          }
        }
      }
    }

    .days {
      display: grid;
      gap: 0rem;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      height: 100%;
      overflow: auto;
      &.loading {
        @include progress-bar(118px, 95px, var(--blue), var(--blue-lighter));
      }
      &.loading.error {
        @include progress-bar(118px, 95px, var(--red), var(--red));
        animation: none;
      }

      &.schedule {
        overflow: hidden;
      }
      &.list {
        .day {
          display: block;

          header {
            position: sticky;
            top: 0;
            margin-top: 0;
            background-color: white;
            height: $headerHeight;
            z-index: 2;
          }
        }
      }
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

      li {
        display: block;
        position: relative;
        height: auto;
        overflow: hidden;
        padding: 0 0.25rem;
        display: grid;
        justify-content: right;
      }
    }

    .day {
      display: grid;
      grid-template-rows: $headerHeight 1fr;
      position: relative;
      header {
        width: 100%;
        overflow: hidden;

        h2 {
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.5rem;
          height: 30px;
          line-height: 1.875;
          font-size: 1rem;
          font-weight: 200;

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
      }

      .epochs {
        position: absolute;
        top: $headerHeight;
        width: 100%;
        height: calc(100% - #{$headerHeight});
        .epoch {
          position: absolute;
          width: 100%;

          .inner {
            margin: 0rem;
            height: calc(100% - 0.5rem - 2px);
            padding: 0.25rem 0;
            width: 8px;
            border-radius: 8px;
            margin: 1px 0;
          }

          &.busy {
            $darkStripe: var(--busy-color-lightened);
            $lightStripe: white;

            background-image: linear-gradient(
              45deg,
              $darkStripe 12.5%,
              $lightStripe 12.5%,
              $lightStripe 50%,
              $darkStripe 50%,
              $darkStripe 62.5%,
              $lightStripe 62.5%,
              $lightStripe 100%
            );
            background-size: 5.66px 5.66px;
          }

          &.closed {
            $darkStripe: var(--closed-color-lightened);
            $lightStripe: white;

            background-image: linear-gradient(
              45deg,
              $darkStripe 12.5%,
              $lightStripe 12.5%,
              $lightStripe 50%,
              $darkStripe 50%,
              $darkStripe 62.5%,
              $lightStripe 62.5%,
              $lightStripe 100%
            );
            background-size: 5.66px 5.66px;
          }

          &.busy .inner {
            background-color: var(--busy-color, #ff647566);
          }
          &.closed .inner {
            background-color: var(--closed-color, #ff647566);
          }
          &.partial .inner {
            background-color: var(--partial-color, #ffff7566);
          }

          &.free .inner {
            background-color: var(--free-color, #36d2addf);
          }

          .available-calendars {
            display: none;
            position: absolute;
            z-index: 2;
            left: 10px;

            span {
              background: rgba(0, 0, 0, 0.5);
              display: inline-block;
              margin: 0;
              padding: 0.25rem;
              color: white;
              border-radius: 4px;
              font-size: 0.6rem;
              // font-weight: 700;
            }
          }
        }
      }

      &:hover .epoch.partial .available-calendars {
        display: block;
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
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          background: transparent;
          position: relative;
          align-items: center;
          justify-content: center;
          align-content: center;
          font-family: sans-serif;

          &.selected {
            background-color: var(--selected-color, var(--blue));
            box-shadow: none;
            border-bottom: 1px solid transparent;
            z-index: 3;
            margin-left: 9px;
            margin-right: 1px;
          }

          &.pending {
            background-color: var(--selected-color-lightened);
            z-index: 3;
            margin-left: 9px;
            margin-right: 1px;
          }

          &.hovering {
            margin-left: 9px;
            margin-right: 1px;
            z-index: 3;
          }

          &.selected + .selected,
          &.pending + .pending {
            z-index: 2;
          }

          &.busy:not(.pending),
          &.closed:not(.pending) {
            cursor: not-allowed;
            margin-left: 8px;
          }

          .selected-heading {
            position: absolute;
            top: 3px;
            left: 0;
            color: white;
            text-shadow: 1px 1px 2px #002db4ff;
            font-weight: 300;
            // background: var(--blue);
            padding: 0 3px;
            // width: calc(100% - 6px);
            font-size: 0.8rem;
            z-index: 3;
            text-align: left;
            font-family: system-ui, sans-serif;
          }

          &.pending .selected-heading {
            width: auto;
          }
          &.hovering:not(.selected) .selected-heading {
            color: var(--selected-color);
            text-shadow: none;
            top: 0;
          }
        }
      }

      .slot-list {
        display: grid;
        grid-auto-rows: 50px;
        grid-auto-flow: row;
        overflow: auto;
        gap: 0.25rem;
        list-style-type: none;
        margin: 0;
        padding: 0;

        .slot {
          border-radius: 4px;
          background: transparent;
          position: relative;
          align-items: center;
          justify-content: center;
          align-content: center;
          font-family: sans-serif;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: none !important;

          @media (hover: hover) and (pointer: fine) {
            // prevents touch-deselect hover state color
            &:hover {
              box-shadow: none;
              background-color: rgba(0, 0, 0, 0.1);
            }
          }

          &.selected {
            background: var(--blue);
            color: white;
          }

          .partial {
            display: block;
            font-size: 0.6rem;
          }
        }
      }
    }
    button.confirm {
      grid-column: -1 / 1;
    }

    &.allow_booking {
      .slot:not(.busy):hover,
      .slot:not(.busy):focus,
      .slot:not(.closed):hover,
      .slot:not(.closed):focus {
        box-shadow: 0 0 1px 0 var(--selected-color);
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
  class:ticked={show_ticks && view_as === "schedule"}
  class:allow_booking
  class:hide-header={!show_header}
  on:mouseleave={() => endDrag(null, null)}
  style="
  --busy-color-lightened: {lightenHexColour(busy_color, 90)};
  --closed-color-lightened: {lightenHexColour(closed_color, 90)};
  --selected-color-lightened: {lightenHexColour(selected_color, 60)}; 
--free-color: {free_color}; --busy-color: {busy_color}; --closed-color: {closed_color}; --partial-color: {partial_color}; --selected-color: {selected_color};"
>
  <header class:dated={allow_date_change}>
    <h2 class="month">
      {#if days[days.length - 1].timestamp.getMonth() !== days[0].timestamp.getMonth()}
        {#if days[days.length - 1].timestamp.getFullYear() !== days[0].timestamp.getFullYear()}
          <!-- Case 1: months and years differ: Dec 2021 - Jan 2022 -->
          {days[0].timestamp.toLocaleDateString("default", {
            month: "short",
            year: "numeric",
          })}
          -
          {days[days.length - 1].timestamp.toLocaleDateString("default", {
            month: "short",
            year: "numeric",
          })}
        {:else}
          <!-- Case 2: months differ, years the same: Oct - Nov 2021 -->
          {days[0].timestamp.toLocaleDateString("default", {
            month: "short",
          })}
          -
          {days[days.length - 1].timestamp.toLocaleDateString("default", {
            month: "short",
            year: "numeric",
          })}
        {/if}
      {:else}
        <!-- Case 3: months, and therefore years, are the same: Oct 2021 -->
        {days[0].timestamp.toLocaleDateString("default", {
          month: "short",
          year: "numeric",
        })}
      {/if}
    </h2>
    {#if allow_date_change}
      <div class="change-dates">
        <button on:click={goToPreviousDate} aria-label="Previous date"
          ><BackIcon style="height:32px;width:32px;" /></button
        >
        <button on:click={goToNextDate} aria-label="Next date"
          ><NextIcon style="height:32px;width:32px;" /></button
        >
      </div>
    {/if}
    <div class="legend">
      <span class="not-available">Not available</span>
      <span class="partially-available">Partially available</span>
      <span class="available">Available</span>
      {#if busy_color !== closed_color}
        <span class="closed">Closed</span>
      {/if}
    </div>
  </header>
  {#if show_ticks && view_as === "schedule"}
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
  <div
    class="days"
    class:schedule={view_as === "schedule"}
    class:list={view_as === "list"}
    class:loading
    class:error={hasError}
    bind:this={dayContainer}
    bind:clientWidth={dayContainerWidth}
  >
    {#each days as day}
      <div class="day">
        <header>
          <h2>
            {#if date_format === "date" || date_format === "full"}
              <span class="date">
                {new Date(day.timestamp).toLocaleString("default", {
                  day: "numeric",
                })}
              </span>
            {/if}
            {#if date_format === "weekday" || date_format === "full"}
              <span>
                {new Date(day.timestamp).toLocaleString("default", {
                  weekday: "short",
                })}
              </span>
            {/if}
          </h2>
        </header>
        {#if view_as === "schedule"}
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
                  {#if show_hosts === "show"}
                    <div class="available-calendars">
                      <span
                        on:mouseenter={(event) => showOverlay(event, epoch)}
                        on:mouseleave={hideOverlay}
                      >
                        {epoch.available_calendars.length} of {allCalendars.length}
                      </span>
                    </div>
                  {/if}
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
                ).toLocaleString()}; Free calendars: {slot.available_calendars.toString()}"
                class="slot {slot.selectionStatus} {slot.availability}"
                class:pending={slot.selectionPending}
                class:hovering={slot.hovering}
                data-start-time={new Date(slot.start_time).toLocaleString()}
                data-end-time={new Date(slot.end_time).toLocaleString()}
                on:mousedown={() => {
                  if (
                    slotSelection.length < max_bookable_slots ||
                    slot.selectionStatus === SelectionStatus.SELECTED
                  ) {
                    mouseIsDown = true;
                  }
                  startDrag(slot, day);
                }}
                on:mouseenter={(e) => {
                  addToDrag(slot, day);
                  if (
                    !mouseIsDown &&
                    slot.selectionStatus !== SelectionStatus.SELECTED
                  ) {
                    slot.hovering = true;
                  }
                }}
                on:mouseleave={() => (slot.hovering = false)}
                on:mouseup={(e) => {
                  if (mouseIsDown) {
                    if (document.activeElement) {
                      document.activeElement.blur();
                    }
                    endDrag(slot, day);
                  }
                }}
                on:keypress={(e) => {
                  if (e.code === "Space" || e.code === "Enter") {
                    startDrag(slot, day);
                    tick().then(() => endDrag(slot, day));
                  }
                }}
              >
                {#if getBlockTimes(slot, day)}
                  <span class="selected-heading"
                    >{getBlockTimes(slot, day)}</span
                  >
                {/if}
                {#if slot.hovering}
                  <span class="selected-heading">
                    {slot.start_time.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                {/if}
              </button>
            {/each}
          </div>
        {:else if view_as === "list"}
          <div class="slot-list">
            {#each day.slots.filter((slot) => slot.availability === AvailabilityStatus.FREE || slot.availability === AvailabilityStatus.PARTIAL) as slot}
              <button
                data-available-calendars={slot.available_calendars.toString()}
                aria-label="{new Date(
                  slot.start_time,
                ).toLocaleString()} to {new Date(
                  slot.end_time,
                ).toLocaleString()}; Free calendars: {slot.available_calendars.toString()}"
                class="slot {slot.selectionStatus} {slot.availability}"
                class:pending={slot.selectionPending}
                data-start-time={new Date(slot.start_time).toLocaleString()}
                data-end-time={new Date(slot.end_time).toLocaleString()}
                on:click={() => {
                  toggleSlot(slot);
                }}
              >
                {new Date(slot.start_time).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
                {#if slot.availability === AvailabilityStatus.PARTIAL}
                  <span class="partial"
                    >({slot.available_calendars.length} of {allCalendars.length}
                    available)</span
                  >
                {/if}
              </button>
            {/each}
          </div>
        {/if}
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
  {#if hasError}
    <nylas-message-error />
  {/if}
</main>
