<svelte:options tag="nylas-availability" />

<script lang="ts">
  import {
    formatTimeSlot,
    setTimeZoneOffset,
  } from "@commons/methods/convertDateTimeZone";
  import {
    ManifestStore,
    AvailabilityStore,
    CalendarStore,
    ErrorStore,
    ContactStore,
  } from "../../../commons/src";
  import { handleError } from "@commons/methods/api";
  import { onMount, afterUpdate, tick } from "svelte";
  import { get_current_component } from "svelte/internal";
  import {
    getEventDispatcher,
    buildInternalProps,
  } from "@commons/methods/component";
  import type { TimeInterval } from "d3-time";
  import { timeWeek, timeDay, timeHour, timeMinute } from "d3-time";
  import { scaleTime, scaleLinear } from "d3-scale";
  import throttle from "just-throttle";
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
    Day,
    PreDatedTimeSlot,
  } from "@commons/types/Availability";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import "@commons/components/ErrorMessage.svelte";
  import {
    getTimeString,
    getCondensedTimeString,
    showDateRange,
  } from "@commons/methods/datetime";
  import AvailableIcon from "./assets/available.svg";
  import UnavailableIcon from "./assets/unavailable.svg";
  import BackIcon from "./assets/left-arrow.svg";
  import NextIcon from "./assets/right-arrow.svg";
  import { isAvailable, isUnavailable } from "./method/slot";

  //#region props
  export let id: string = "";
  export let access_token: string = "";

  export let allow_booking: boolean;
  export let allow_date_change: boolean;
  export let attendees_to_show: number;
  export let booking_user_email: string;
  export let booking_user_token: string;
  export let busy_color: string;
  export let calendars: Calendar[];
  export let capacity: number | null;
  export let closed_color: string;
  export let date_format: "weekday" | "date" | "full" | "none";
  export let dates_to_show: number;
  export let email_ids: string[]; // Deprecated. Use participants instead.
  export let participants: string[];
  export let end_hour: number;
  export let event_buffer: number;
  export let free_color: string;
  export let mandate_top_of_hour: boolean;
  export let max_bookable_slots: number;
  export let max_book_ahead_days: number;
  export let min_book_ahead_days: number;
  export let open_hours: AvailabilityRule[];
  export let overbooked_threshold: number;
  export let partial_bookable_ratio: number;
  export let partial_color: string;
  export let required_participants: string[];
  export let selected_color: string;
  export let show_as_week: boolean;
  export let show_header: boolean;
  export let show_hosts: "show" | "hide";
  export let show_ticks: boolean;
  export let show_weekends: boolean;
  export let slot_size: number; // in minutes
  export let start_date: Date;
  export let start_hour: number;
  export let timezone: string;
  export let view_as: "schedule" | "list";

  const defaultValueMap: Partial<Manifest> = {
    allow_booking: false,
    allow_date_change: true,
    attendees_to_show: 5,
    busy_color: "#EE3248cc",
    calendars: [],
    closed_color: "#EE3248cc",
    date_format: "full",
    dates_to_show: 1,
    email_ids: [],
    participants: [],
    end_hour: 24,
    event_buffer: 0,
    free_color: "#078351cc",
    mandate_top_of_hour: false,
    max_bookable_slots: 1,
    max_book_ahead_days: 30,
    min_book_ahead_days: 0,
    open_hours: [],
    overbooked_threshold: 100,
    partial_bookable_ratio: 0.01,
    partial_color: "#FECA7Ccc",
    required_participants: [],
    selected_color: "#002db4",
    show_as_week: false,
    show_header: true,
    show_hosts: "show",
    show_ticks: true,
    show_weekends: true,
    slot_size: 15,
    start_date: new Date(),
    start_hour: 0,
    timezone: "",
    view_as: "schedule",
  };

  $: hasError = Object.keys($ErrorStore).length ? true : false;
  /**
   * Re-loads availability data from the Nylas API.
   * @param {boolean} clearSelection Used to indicate whether any currently selected timeslots should be cleared. Defaults to false.
   * @param {boolean} slotsBooked Used to indicate whether the component should assume the previously selected slots were booked. Defaults to false.
   */
  export async function reload(clearSelection = false, slotsBooked = false) {
    await getAvailability(true);

    if (slotsBooked) {
      const selectedSlots: any = [];
      for (const day of days) {
        // TODO: verify that this works now that API-fetched availability is of type "free" rather than "busy" (see status="busy" in selected slots below)
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

      for (const calendar of allCalendars) {
        calendar.timeslots.push(...selectedSlots);
      }
    }

    if (clearSelection && Array.isArray(days)) {
      for (const day of days) {
        for (const slot of day.slots) {
          slot.selectionStatus = SelectionStatus.UNSELECTED;
        }
      }
      days = [...days];
    }
  }

  //#endregion props

  type SlotRefs = Record<string, Array<HTMLElement | null>>;

  //#region mount and prop initialization
  let _this = <Manifest>buildInternalProps({}, {}, defaultValueMap);
  let manifest: Partial<Manifest> = {};
  let loading: boolean;
  let dayRef: HTMLElement[] = [];
  let slotRef: SlotRefs = {}; // mapping of dates to slot button DOM nodes
  let dayOrder: string[] = []; // maintains order of displayed dates
  let slotYPositions: Record<string, DOMRect> = {};
  let shouldUpdateSlotPositions = false;
  let dayXPositions: Record<string, DOMRect> = {};
  let shouldUpdateDayPositions = false;

  $: {
    if (
      _this.dates_to_show ||
      _this.show_ticks ||
      _this.show_as_week ||
      _this.show_weekends
    ) {
      // Changes to these props will resize the width of day container
      dayRef = dayRef.filter((day) => !!day);
      shouldUpdateDayPositions = true;
    }
  }

  $: {
    if (
      _this.dates_to_show ||
      _this.show_as_week ||
      _this.show_weekends ||
      _this.start_hour ||
      _this.end_hour ||
      _this.slot_size ||
      _this.show_header ||
      _this.allow_date_change
    ) {
      // Changes to these props changes the height of our slot buttons
      shouldUpdateSlotPositions = true;
    }
  }

  $: calendarID = "";
  onMount(async () => {
    await tick();
    loading = true;
    clientHeight = main?.getBoundingClientRect().height;
    dayContainerWidth = main?.getBoundingClientRect().height;
    const storeKey = JSON.stringify({
      component_id: id,
      access_token,
    });
    manifest = (await $ManifestStore[storeKey]) || {};

    participants = email_ids; // handles deprecated email_ids prop

    _this = buildInternalProps($$props, manifest, defaultValueMap) as Manifest;

    const calendarQuery: CalendarQuery = {
      access_token,
      component_id: id,
      calendarIDs: [], // empty array will fetch all calendars
    };
    // TODO: we probably dont want to expose a list of all a users calendars to the end-user here.
    const calendarsList = await CalendarStore.getCalendars(calendarQuery);
    loading = false;
    calendarID = calendarsList?.find((cal) => cal.is_primary)?.id || "";
  });

  let previousProps = $$props;
  $: {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as Manifest;
      previousProps = $$props;
    }
  }

  function recalibratePositions(ref: HTMLElement[]) {
    if (!ref) {
      return {};
    }

    return ref.reduce<Record<string, DOMRect>>(
      (allPositions, currentSlot, i) => {
        if (currentSlot) {
          allPositions[i] = currentSlot.getBoundingClientRect();
        }
        return allPositions;
      },
      {},
    );
  }

  afterUpdate(() => {
    if (shouldUpdateSlotPositions) {
      slotYPositions = recalibratePositions(
        <HTMLElement[]>Object.values(slotRef)[0],
      );
      shouldUpdateSlotPositions = false;
    }
    if (shouldUpdateDayPositions && dayRef) {
      dayXPositions = recalibratePositions(dayRef);
      shouldUpdateDayPositions = false;
    }
  });

  async function getContact(email: string) {
    const contactQuery = {
      component_id: id,
      access_token,
      query: `?email=${email}`,
    };
    if (id) {
      let contact = $ContactStore[JSON.stringify(contactQuery)];
      if (!contact) {
        contact = await ContactStore.addContact(contactQuery);
      }
      return contact[0] ?? {};
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

  const MINIMUM_DAY_WIDTH = 100;

  // Internally-settable reactive-to-external-props variable
  let datesToShow: number;

  $: optimalDatesToShow =
    Math.floor(dayContainerWidth / MINIMUM_DAY_WIDTH) || 1;
  $: datesToShow =
    optimalDatesToShow < _this.dates_to_show || _this.show_as_week
      ? optimalDatesToShow
      : _this.dates_to_show;

  $: tooSmallForWeek = _this.show_as_week && optimalDatesToShow < 7;

  //#endregion layout

  //#region data generation

  // You can have as few as 1, and as many as 7, days shown
  // start_date and datesToShow get overruled by show_as_week (always shows 5 or 7 dates that include your start_date instead)
  let startDay: Date; // the first day column shown; depends on show_as_week
  let endDay: Date;

  $: dayRange = (() => {
    return (
      (_this.show_weekends || !_this.show_weekends) &&
      generateDayRange(
        startDay, // TODO: weird just to get show_weekends passed in
        _this.show_as_week
          ? timeDay.offset(startDay, tooSmallForWeek ? datesToShow - 1 : 6)
          : timeDay.offset(startDay, datesToShow - 1),
      )
    );
  })();

  $: startDay = (() => {
    return _this.show_as_week && !tooSmallForWeek
      ? timeWeek.floor(_this.start_date)
      : timeDay.floor(_this.start_date);
  })();

  $: endDay = dayRange[dayRange.length - 1];

  const allRequiredParticipantsIncluded = (calendars: string[]) => {
    return requiredParticipants.every((participant) =>
      calendars.includes(participant),
    );
  };

  // map over the ticks() of the time scale between your start day and end day
  // populate them with as many slots as your start_hour, end_hour, and slot_size dictate
  $: generateDaySlots = function (
    timestamp: Date,
    startHour: number,
    endHour: number,
  ) {
    const dayStart = timeHour(
      new Date(new Date(timestamp).setHours(startHour)),
    );
    const dayEnd = timeHour(new Date(new Date(timestamp).setHours(endHour)));
    return scaleTime()
      .domain([dayStart, dayEnd])
      .ticks(timeMinute.every(_this.slot_size) as TimeInterval)
      .slice(0, -1) // dont show the 25th hour
      .map((time: Date) => {
        const endTime = timeMinute.offset(time, _this.slot_size);
        const freeCalendars: string[] = [];
        let availability = AvailabilityStatus.FREE; // default
        if (allCalendars.length) {
          for (const calendar of allCalendars) {
            const slot = {
              start_time: time,
              end_time: endTime,
              available_calendars: [],
            };

            // Adjust calendar.timeslots for buffers
            const timeslots =
              calendar.availability === AvailabilityStatus.BUSY
                ? calendar.timeslots.map((slot: TimeSlot) => ({
                    start_time: timeMinute.offset(
                      slot.start_time,
                      -_this.event_buffer,
                    ),
                    end_time: timeMinute.offset(
                      slot.end_time,
                      _this.event_buffer,
                    ),
                    available_calendars: slot.available_calendars,
                  }))
                : calendar.timeslots.map((slot: TimeSlot) => ({
                    // Don't apply start-buffer to the first timeslot, nor end-buffer to the last timeslot.
                    // Works across multiple days; you won't get a random buffer at 11:50 / 00:10
                    start_time: timeMinute.offset(
                      slot.start_time,
                      slot === calendar.timeslots[0] ? 0 : _this.event_buffer,
                    ),
                    end_time: timeMinute.offset(
                      slot.end_time,
                      slot === calendar.timeslots[calendar.timeslots.length - 1]
                        ? 0
                        : -_this.event_buffer,
                    ),
                    available_calendars: slot.available_calendars,
                  }));

            let concurrentSlotEventsForUser = 0;
            if (calendar.availability === AvailabilityStatus.BUSY) {
              // For Busy calendars, a timeslot is considered available if its calendar has no overlapping events
              concurrentSlotEventsForUser = overlap(timeslots, slot);
            } else if (calendar.availability === AvailabilityStatus.FREE) {
              // For Free calendars, a timeslot is considered available if its calendar has a time that fully envelops it.
              concurrentSlotEventsForUser = timeslots.some(
                (blob: TimeSlot) =>
                  slot.start_time >= blob.start_time &&
                  slot.end_time <= blob.end_time,
              )
                ? 1
                : 0;
              // slot availability is when a given timeslot has all of its minutes represented in calendar.free timeslots
            }
            if (calendar.availability === AvailabilityStatus.BUSY) {
              if (
                _this.capacity &&
                _this.capacity >= 1 &&
                concurrentSlotEventsForUser < _this.capacity
              ) {
                freeCalendars.push(calendar?.account?.emailAddress || "");
              } else if (!concurrentSlotEventsForUser) {
                freeCalendars.push(calendar?.account?.emailAddress || "");
              }
            } else if (
              calendar.availability === AvailabilityStatus.FREE ||
              !calendar.availability
            ) {
              // if a calendar is passed in without availability, assume the timeslots are available.
              if (concurrentSlotEventsForUser) {
                freeCalendars.push(calendar?.account?.emailAddress || "");
              }
            }
          }

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
          freeCalendars.length <
            allCalendars.length * _this.partial_bookable_ratio
        ) {
          availability = AvailabilityStatus.BUSY;
        }

        // Allows users to book over busy slots if partial_bookable_ratio is 0
        if (
          availability === AvailabilityStatus.BUSY &&
          _this.partial_bookable_ratio === 0
        ) {
          availability = AvailabilityStatus.PARTIAL;
        }

        // If availability is partial, but a required participant is unavailble, the slot becomes Busy
        if (
          availability === AvailabilityStatus.PARTIAL &&
          _this.required_participants.length
        ) {
          if (!allRequiredParticipantsIncluded(freeCalendars)) {
            availability = AvailabilityStatus.BUSY;
          }
        }

        // If mandate_top_of_hour, change any status to "busy" if it's not at :00
        if (_this.mandate_top_of_hour && time.getMinutes() !== 0) {
          availability = AvailabilityStatus.BUSY;
          freeCalendars.length = 0;
        }

        // if the "open_hours" property has rules, adhere to them above any other event-based free/busy statuses
        // (Mark the slot busy if it falls outside the open_hours)
        if (_this.open_hours.length) {
          if (availability !== AvailabilityStatus.BUSY) {
            let dayRelevantRules = [];
            dayRelevantRules = _this.open_hours.filter(
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
    (days[0] ?? {}).slots?.map((slot: TimeSlot) => slot.start_time),
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
    if (height === undefined || ticks === undefined) {
      return [];
    }

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
      tickIters < _this.slot_size || // dont show 15-min ticks if slot size is hourly
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
    partialBookableRatio: number,
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
          numFreeCalendars < allCalendars.length * partialBookableRatio;

        if (
          numFreeCalendars === 0 ||
          fewerCalendarsThanRatio ||
          (_this.required_participants.length &&
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
        if (_this.show_weekends) {
          return true;
        } else {
          return timestamp.getDay() !== 6 && timestamp.getDay() !== 0;
        }
      });
    if (!_this.show_as_week && !_this.show_weekends) {
      if (range.length < datesToShow) {
        if (reverse) {
          return generateDayRange(timeDay.offset(startDay, -1), endDay, true);
        }
        return generateDayRange(startDay, timeDay.offset(endDay, 1));
      }
    }
    return range;
  }

  function checkOverbooked(slots: SelectableSlot[]) {
    allCalendars.forEach((calendar) => {
      let availableSlotsForCalendar = slots.filter((slot) =>
        slot.available_calendars.includes(calendar.account?.emailAddress),
      );
      if (
        slots.length - availableSlotsForCalendar.length >
        (_this.overbooked_threshold * slots.length) / 100
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
    const slots = checkOverbooked(
      generateDaySlots(timestamp, _this.start_hour, _this.end_hour),
    ); // TODO: include other potential post-all-slots-established checks, like overbooked, in a single secondary run here.

    const today = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const dayOffset = Math.ceil(
      (new Date(timestamp).getTime() - today) / (1000 * 60 * 60 * 24),
    );

    return {
      epochs: generateEpochs(slots, _this.partial_bookable_ratio),
      isBookable:
        dayOffset >= 0 &&
        dayOffset >= _this.min_book_ahead_days &&
        dayOffset <= _this.max_book_ahead_days,
      slots,
      timestamp,
    };
  });
  //#endregion data generation

  // #region timeSlot selection
  let slotSelection: SelectableSlot[] = [];
  let sortedSlots: SelectableSlot[] = [];
  $: slotSelection = (days ?? [])
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
      dispatchEvent("timeSlotChosen", {
        timeSlots: sortedSlots.map((slot) => Object.assign({}, slot)),
      });
      lastDispatchedSlots = sortedSlots;
    }
  }

  // https://derickbailey.com/2015/09/07/check-for-date-range-overlap-with-javascript-arrays-sorting-and-reducing/
  function overlap(events: TimeSlot[], slot: TimeSlot) {
    return events.reduce((result, current) => {
      const overlap =
        slot.start_time < current.end_time &&
        current.start_time < slot.end_time;

      if (overlap) {
        // store the amount of overlap
        result++;
      }
      return result;
    }, 0);
  }
  // #endregion timeSlot selection

  function getAvailabilityQuery(
    emailAddresses = _this.participants,
    accessToken = access_token,
  ): AvailabilityQuery {
    return {
      body: {
        emails: emailAddresses,
        free_busy: [],
        duration_minutes: 5, // minumum allowed duration/interval
        interval_minutes: 5,
        start_time:
          timeHour(
            new Date(new Date(startDay).setHours(_this.start_hour)),
          ).getTime() / 1000,
        end_time:
          timeHour(
            new Date(new Date(endDay).setHours(_this.end_hour)),
          ).getTime() / 1000,
        round_robin: "max-availability",
      },
      component_id: id,
      access_token: accessToken,
    };
  }

  let newCalendarTimeslotsForGivenEmails: any[] = [];
  $: (async () => {
    if (
      (Array.isArray(_this.participants) && _this.participants.length > 0) ||
      (_this.booking_user_email && _this.booking_user_token)
    ) {
      await getAvailability();
    }
  })();

  // If 2 slots bump up to each other consider them a single group of time
  function groupConsecutiveTimeslots(slots: PreDatedTimeSlot[] = []) {
    return slots.reduce((groups, slot) => {
      const prevSlot: PreDatedTimeSlot = groups[groups.length - 1];
      if (prevSlot && prevSlot.end_time === slot.start_time) {
        prevSlot.end_time = slot.end_time;
      } else {
        groups.push({ ...slot }); // TODO: types ¯\_(ツ)_/¯
      }
      return groups;
    }, []);
  }

  let requiredParticipants: string[] = [];
  $: requiredParticipants = [
    ...new Set([..._this.required_participants, booking_user_email]),
  ];

  async function getAvailability(forceReload = false) {
    loading = true;
    let freeBusyCalendars: any = [];
    // Free-Busy endpoint returns busy timeslots for given participants between start_time & end_time

    type fetchableCalendarUser = { email: string; token?: string };
    let calendarsToFetch: fetchableCalendarUser[] = _this.participants.map(
      (email) => {
        return {
          email,
        };
      },
    );

    // If the booking user and access token are passed in, fetch their calendars as well.
    // TODO: dont include them in the main list, as they shouldn't contribute to partial slot availability.
    // TODO: use booking_user_token instead of access_token for booking_user_email in calendarsToFetch
    if (_this.booking_user_email && _this.booking_user_token) {
      calendarsToFetch.push({
        email: _this.booking_user_email,
        token: _this.booking_user_token,
      });
    }

    if (Array.isArray(calendarsToFetch) && calendarsToFetch.length > 0) {
      const fetchedCalendars = await $AvailabilityStore[
        JSON.stringify({
          ...getAvailabilityQuery(
            calendarsToFetch.map((x) => x.email),
            access_token,
          ),
          forceReload,
        })
      ];

      loading = false;

      // A user can load several queries in quick succession, and their variable latency can lead to race conditions.
      // This condition checks to see if the returned schedule's date and the component active date are the same.
      // If not, circuit break.
      if (
        timeDay(
          new Date(getAvailabilityQuery().body.start_time * 1000),
        ).getTime() !==
        timeDay(
          new Date(fetchedCalendars.time_slots[0]?.start_time * 1000),
        ).getTime()
      ) {
        return;
      }

      const timeSlotMap: Record<string, PreDatedTimeSlot[]> = {};

      for (const user of fetchedCalendars?.order) {
        timeSlotMap[user] = [];
      }

      for (const slot of fetchedCalendars.time_slots) {
        slot.emails.forEach((e) => timeSlotMap[e].push(slot));
      }

      fetchedCalendars?.order.forEach((user: any) => {
        freeBusyCalendars.push({
          emailAddress: user,
          account: {
            emailAddress: user, // ¯\_(ツ)_/¯
          },
          availability: AvailabilityStatus.FREE,
          timeslots: groupConsecutiveTimeslots(timeSlotMap[user]).map(
            (slot: PreDatedTimeSlot) => ({
              start_time: new Date(slot.start_time * 1000),
              end_time: new Date(slot.end_time * 1000),
            }),
          ),
        });
      });

      newCalendarTimeslotsForGivenEmails = [...freeBusyCalendars];

      return newCalendarTimeslotsForGivenEmails;
    }
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

    const precedingSlot: SelectableSlot | undefined = day.slots[slotIndex - 1];

    const precedingSlotIsUnavailable = precedingSlot
      ? isUnavailable(precedingSlot)
      : false;

    if (
      slot.selectionPending &&
      isAvailable(slot) &&
      (!precedingSlot?.selectionPending || precedingSlotIsUnavailable)
    ) {
      let pendingEndTime =
        day.slots.find((daySlot) => {
          return (
            daySlot.start_time > slot.start_time &&
            (!daySlot.selectionPending || isUnavailable(daySlot))
          );
        })?.start_time || day.slots[day.slots.length - 1].end_time;
      let startTime = getCondensedTimeString(slot.start_time).replace(" ", "");
      let endTime = getCondensedTimeString(pendingEndTime).replace(" ", "");
      return `${startTime} - ${endTime}`;
      // Otherwise, it's first in a selected block if its start_time matches a sortedSlot's start_time
    } else if (wrappingSortedSlot) {
      let startTime = getCondensedTimeString(wrappingSortedSlot.start_time);
      let endTime = getCondensedTimeString(wrappingSortedSlot.end_time);
      return `${startTime.replace(" ", "")} - ${endTime.replace(" ", "")}`;
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
    ...(_this.calendars ?? []),
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
    if (_this.attendees_to_show > 0) {
      displayedAttendees = selectedAttendees.slice(0, _this.attendees_to_show);
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
    if (_this.show_as_week && !tooSmallForWeek) {
      _this.start_date = timeWeek.offset(endDay, 1);
    } else {
      _this.start_date = timeDay.offset(endDay, 1);
    }
  }
  function goToPreviousDate() {
    if (_this.show_as_week && !tooSmallForWeek) {
      _this.start_date = timeWeek.offset(startDay, -1);
    } else {
      // Can't do something as simple as `start_date = timeDay.offset(startDay, -datesToShow)` here;
      // broken case: !show_weekends, start_date = a monday, datesToShow = 3; go backwards. You'll get fri-mon-tues, rather than wed-thu-fri.
      // Instead, we generateDayRange() with reverse=true to take advance of recursive non-weekend range-making.
      let previousRange = generateDayRange(
        timeDay.offset(startDay, -datesToShow),
        timeDay.offset(endDay, -datesToShow),
        true,
      );
      _this.start_date = previousRange[0];
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
  let touchIsDown = false;
  let dragStartSlot: SelectableSlot | null = null;
  let dragStartDay: Day | null = null;
  let draggingExistingBlock: boolean = false;
  let currentTouchedSlot: SelectableSlot | null = null;
  /**
   * Typical order of events triggered for a single input:
   * - touchstart, Zero or more touchmove events, depending on movement of the finger(s), touchend, mousemove, mousedown, mouseup, click
   * To avoid conflicting mouse events and touch events, we need to track if user is on mobile to exclusively trigger
   * mouse event flow or touch event flow.
   */
  let touchPriority = false;

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
    touchIsDown = false;
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
    if (_this.allow_booking && day.isBookable) {
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
        slotSelection.length < _this.max_bookable_slots &&
        isAvailable(slot)
      ) {
        slot.selectionPending = true;
      }
    }
  }

  function addToDrag(slot: SelectableSlot, day: Day) {
    if (day.isBookable && (mouseIsDown || touchIsDown)) {
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

        if (_this.allow_booking && day === dragStartDay && dragStartSlot) {
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
              daySlot.selectionPending = isAvailable(daySlot); // when you're dragging over a busy spot, don't set it to pending.
            } else {
              if (daySlot.selectionPending) {
                daySlot.selectionPending = false;
              }
            }
          });

          // Don't let the user book more slots than are allowed
          const remainingSlots =
            _this.max_bookable_slots -
            (slotSelection.length +
              day.slots.filter(
                (slot) =>
                  slot.selectionPending ||
                  slot.selectionStatus === SelectionStatus.SELECTED,
              ).length);
          const pendingSlots = day.slots.filter(
            (slot) => slot.selectionPending,
          );
          if (remainingSlots < 0) {
            if (direction === "forward") {
              // Only select the first N allowed slots AFTER your initially-dragegd one
              pendingSlots
                .slice(remainingSlots)
                .forEach((slot) => (slot.selectionPending = false));
            } else {
              // Only select the first N allowed slots BEFORE your initially-dragegd one
              pendingSlots
                .slice(0, -remainingSlots)
                .forEach((slot) => (slot.selectionPending = false));
            }
          }
        }
      }
      days = [...days]; // re-render
    }
  }

  function endDrag(day: Day | null) {
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
          day.slots.forEach((slot) => {
            if (slot.selectionPending && isAvailable(slot)) {
              slot.hovering = false;
              slot.selectionStatus = SelectionStatus.SELECTED;
            }
          }),
        );
      }
    } else {
      // Mode: Drag-creating a new event
      days.forEach((day) =>
        day.slots.forEach((slot) => {
          if (slot.selectionPending) {
            slot.selectionStatus = SelectionStatus.SELECTED;
            slot.hovering = false;
          }
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
    } else if (slotSelection.length < _this.max_bookable_slots) {
      slot.selectionStatus = SelectionStatus.SELECTED;
    }
    days = [...days];
  }
  //#endregion dragging

  //#region slot interaction handlers
  type SlotInteractionHandler = {
    event: MouseEvent | TouchEvent;
    slot: SelectableSlot | null;
    day: Day;
  };
  function handleSlotInteractionStart({
    event,
    slot,
    day,
  }: SlotInteractionHandler) {
    if (slot) {
      if (
        slotSelection.length < _this.max_bookable_slots ||
        slot.selectionStatus === SelectionStatus.SELECTED
      ) {
        if (event instanceof MouseEvent) mouseIsDown = true;
        else if (event instanceof TouchEvent) touchIsDown = true;
      }

      startDrag(slot, day);
    }
  }

  function handleSlotHover({ event, slot, day }: SlotInteractionHandler) {
    if (slot) {
      addToDrag(slot, day);

      if (!mouseIsDown && slot.selectionStatus !== SelectionStatus.SELECTED)
        if (event instanceof MouseEvent) slot.hovering = true;
    }
  }

  function handleSlotInteractionEnd(day: Day | null) {
    if (mouseIsDown || touchIsDown) {
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();

      endDrag(day);
    }
  }

  function handleTouchMovement(event: TouchEvent) {
    // On touch events, we need to manually calculate
    // the position of the touch event and determine which slot is hovered
    if (
      event instanceof TouchEvent &&
      event.touches.length === 1 &&
      event.changedTouches.length === 1 // check if there is a single touch point
    ) {
      const { pageX: touchPositionX, pageY: touchPositionY } =
        event.changedTouches[0];

      const currentTouchedDayPosition = Object.entries(dayXPositions).find(
        ([_, dayPosition]) => dayPosition.x > touchPositionX,
      ); // [index, DOMRect]

      const currentTouchedSlotPosition = Object.entries(slotYPositions).find(
        ([_, slotPosition]) => slotPosition.y > touchPositionY,
      ); // [index, DOMRect]

      if (currentTouchedSlotPosition) {
        const currentTouchedDayIndex = currentTouchedDayPosition
          ? Number(currentTouchedDayPosition[0])
          : days.length;

        const hoveredDay = days[currentTouchedDayIndex - 1];

        const [currentTouchedSlotIndex] = currentTouchedSlotPosition;

        currentTouchedSlot =
          hoveredDay.slots[Number(currentTouchedSlotIndex) - 1];

        handleSlotHover({ event, slot: currentTouchedSlot, day: hoveredDay });
      }
    }
  }

  const throttledTouchMovement = throttle(handleTouchMovement, 100);

  function arrowNavigate({
    code,
    currentDay,
    slotIndex,
  }: {
    code: string;
    currentDay: Date;
    slotIndex: number;
  }) {
    if (code === "ArrowDown") {
      slotRef[currentDay.toLocaleDateString()][slotIndex + 1]?.focus();
    } else if (code === "ArrowUp") {
      slotRef[currentDay.toLocaleDateString()][slotIndex - 1]?.focus();
    } else if (code === "ArrowLeft") {
      const currentDayKey = dayOrder.indexOf(currentDay.toLocaleDateString());
      const prevDay = dayOrder[currentDayKey - 1];

      slotRef[prevDay]?.[slotIndex]?.focus();
    } else if (code === "ArrowRight") {
      const currentDayKey = dayOrder.indexOf(currentDay.toLocaleDateString());
      const nextDay = dayOrder[currentDayKey + 1];

      slotRef[nextDay]?.[slotIndex]?.focus();
    }
  }
  //#endregion slot interaction handlers

  // #region error
  $: if (id && _this.participants.length && _this.capacity) {
    try {
      handleError(id, {
        name: "IncompatibleProperties",
        message:
          "Setting `capacity` currently does not work with `participants`. Please use `calendars` to use `capacity`.",
      });
    } catch (error) {
      console.error(error);
    }
  } else if (_this.capacity && _this.capacity < 1) {
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

  function storeRef(
    node: HTMLElement,
    params: { dateKey: string; slotIndex: number; startTime: string },
  ) {
    if (typeof slotRef[params.dateKey] === "undefined") {
      dayOrder = dayOrder.concat(params.dateKey).sort();
      slotRef[params.dateKey] = [];
    }

    slotRef[params.dateKey][params.slotIndex] = node;

    return {
      destroy() {
        // Find the node that was destroyed in hashmap
        const elemIndex = slotRef[params.dateKey].indexOf(node);

        // clean up slotRef hashmap
        if (elemIndex >= 0) slotRef[params.dateKey].splice(elemIndex, 1);
        if (slotRef[params.dateKey].length === 0) {
          dayOrder = dayOrder.filter((day) => day !== params.dateKey);
          delete slotRef[params.dateKey];
        }
      },
    };
  }

  //#region colours
  // Show partial availability as a gradient, rather than as categorically "partial"
  $: partialScale = scaleLinear()
    .domain([0, allCalendars?.length / 2, allCalendars?.length])
    .range([_this.busy_color, _this.partial_color, _this.free_color]);
  //#endregion colours
</script>

<style lang="scss">
  @import "./styles/availability.scss";
</style>

{#if manifest && manifest.error}
  <nylas-error {id} />
{:else if _this.participants.length === 0}
  <nylas-message-error
    error_message="Please enter participants to see availability."
  />
{:else}
  <main
    bind:this={main}
    bind:clientHeight
    class:ticked={_this.show_ticks && _this.view_as === "schedule"}
    class:timezone={_this.timezone}
    class:allow_booking={_this.allow_booking}
    class:hide-header={!_this.show_header}
    on:mouseleave={() => endDrag(null)}
    style="
    --busy-color-lightened: {lightenHexColour(_this.busy_color, 90)};
    --closed-color-lightened: {lightenHexColour(_this.closed_color, 90)};
    --selected-color-lightened: {lightenHexColour(_this.selected_color, 60)}; 
    --free-color: {_this.free_color}; --busy-color: {_this.busy_color}; 
    --closed-color: {_this.closed_color}; --partial-color: {_this.partial_color};
    --selected-color: {_this.selected_color};"
  >
    <header class:dated={_this.allow_date_change}>
      <h2 class="month">{showDateRange(days)}</h2>
      {#if _this.allow_date_change}
        <div class="change-dates">
          <button on:click={goToPreviousDate} aria-label="Previous date">
            <BackIcon style="height:32px;width:32px;" />
          </button>
          <button on:click={goToNextDate} aria-label="Next date">
            <NextIcon style="height:32px;width:32px;" />
          </button>
        </div>
      {/if}
      <div class="legend">
        <span class="not-available">Not available</span>
        <span class="partially-available">Partially available</span>
        <span class="available">Available</span>
        {#if _this.busy_color !== _this.closed_color}
          <span class="closed">Closed</span>
        {/if}
      </div>
    </header>
    {#if _this.show_ticks && _this.view_as === "schedule"}
      {#if _this.timezone}
        <div class="timezone-ticks">
          <p class="timezone">
            {setTimeZoneOffset(ticks[0], _this.timezone)}
          </p>
          <ul class="ticks">
            {#each ticks as tick}
              <li class="tick">
                {formatTimeSlot(tick, _this.timezone)}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      <ul class="ticks" bind:this={tickContainer}>
        {#each ticks as tick}
          <li class="tick">
            {getTimeString(tick)}
          </li>
        {/each}
      </ul>
    {/if}
    <div
      class="days"
      class:schedule={_this.view_as === "schedule"}
      class:list={_this.view_as === "list"}
      class:loading
      class:timezone={_this.timezone}
      class:error={hasError}
      bind:this={dayContainer}
      bind:clientWidth={dayContainerWidth}
    >
      {#each days as day, dayIndex (day.timestamp.toISOString())}
        <div
          class="day"
          data-timestamp={day.timestamp.toISOString()}
          bind:this={dayRef[dayIndex]}
        >
          <header>
            <h2>
              {#if _this.date_format === "date" || _this.date_format === "full"}
                <span class="date">
                  {new Date(day.timestamp).toLocaleString("default", {
                    day: "numeric",
                  })}
                </span>
              {/if}
              {#if _this.date_format === "weekday" || _this.date_format === "full"}
                <span>
                  {new Date(day.timestamp).toLocaleString("default", {
                    weekday: "short",
                  })}
                </span>
              {/if}
            </h2>
          </header>
          {#if _this.view_as === "schedule"}
            <div class="epochs">
              {#each day.epochs as epoch}
                <div
                  class="epoch {epoch.status}"
                  style="height: {epoch.height}%; top: {epoch.offset}%;"
                  data-available-calendars={epoch.available_calendars.toString()}
                  data-start-time={new Date(epoch.start_time).toLocaleString()}
                  data-end-time={new Date(epoch.end_time).toLocaleString()}
                >
                  <div
                    class="inner"
                    style="background-color: {partialScale(
                      epoch.available_calendars.length,
                    )}"
                  >
                    {#if _this.show_hosts === "show"}
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
              {#each day.slots as slot, slotIndex (slot.start_time.toISOString())}
                <button
                  data-available-calendars={slot.available_calendars.toString()}
                  aria-label="{new Date(
                    slot.start_time,
                  ).toLocaleString()} to {new Date(
                    slot.end_time,
                  ).toLocaleString()}; Free calendars: {slot.available_calendars.toString()}"
                  use:storeRef={{
                    dateKey: day.timestamp.toLocaleDateString(),
                    slotIndex,
                    startTime: new Date(slot.start_time).toLocaleString(),
                  }}
                  class="slot {slot.selectionStatus} {slot.availability}"
                  class:pending={slot.selectionPending}
                  class:hovering={slot.hovering}
                  data-start-time={new Date(slot.start_time).toLocaleString()}
                  data-end-time={new Date(slot.end_time).toLocaleString()}
                  on:mousedown={(event) => {
                    if (!touchPriority)
                      handleSlotInteractionStart({ event, slot, day });
                  }}
                  on:mouseenter={(event) => {
                    if (!touchPriority) handleSlotHover({ event, slot, day });
                  }}
                  on:mouseleave={() => (slot.hovering = false)}
                  on:mouseup={() => {
                    if (!touchPriority && mouseIsDown)
                      handleSlotInteractionEnd(day);
                  }}
                  on:keypress={(e) => {
                    if (e.code === "Space" || e.code === "Enter") {
                      startDrag(slot, day);
                      tick().then(() => endDrag(day));
                    }
                  }}
                  on:keydown={({ code }) => {
                    if (code.startsWith("Arrow")) {
                      arrowNavigate({
                        code,
                        currentDay: day.timestamp,
                        slotIndex,
                      });
                    }
                  }}
                  on:touchstart={(event) => {
                    const isFirstTouch =
                      event.touches.length === 1 &&
                      event.changedTouches.length === 1;

                    if (isFirstTouch) {
                      touchPriority = true;
                      handleSlotInteractionStart({ event, slot, day });
                    }
                  }}
                  on:touchmove={throttledTouchMovement}
                  on:touchend={(event) => {
                    const isLastTouch =
                      event.touches.length === 0 &&
                      event.changedTouches.length === 1;

                    if (isLastTouch) {
                      const { pageX, pageY: touchPositionY } =
                        event.changedTouches[0];

                      const currentTouchedSlotPosition = Object.entries(
                        slotYPositions,
                      ).find(
                        ([_, slotPosition]) => slotPosition.y > touchPositionY,
                      );

                      if (currentTouchedSlotPosition) {
                        const [currentTouchedSlotIndex] =
                          currentTouchedSlotPosition;

                        currentTouchedSlot =
                          day.slots[Number(currentTouchedSlotIndex)];
                      }

                      if (slot !== currentTouchedSlot) {
                        handleSlotInteractionEnd({
                          event,
                          slot: currentTouchedSlot,
                          day,
                        });
                      }
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
                      {getCondensedTimeString(slot.start_time)}
                    </span>
                  {/if}
                </button>
              {/each}
            </div>
          {:else if _this.view_as === "list"}
            <div class="slot-list">
              {#each day.slots.filter((slot) => slot.availability === AvailabilityStatus.FREE || slot.availability === AvailabilityStatus.PARTIAL) as slot}
                <button
                  data-available-calendars={slot.available_calendars.toString()}
                  aria-label="{getTimeString(
                    new Date(slot.start_time),
                  )} to {getTimeString(
                    new Date(slot.end_time),
                  )}; Free calendars: {slot.available_calendars.toString()}"
                  class="slot {slot.selectionStatus} {slot.availability}"
                  class:pending={slot.selectionPending}
                  data-start-time={new Date(slot.start_time).toLocaleString()}
                  data-end-time={new Date(slot.end_time).toLocaleString()}
                  on:click={() => toggleSlot(slot)}
                >
                  {getTimeString(new Date(slot.start_time))}
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
        {selectedAttendees.filter((attendee) => attendee.isAvailable).length} of
        {allCalendars.length}
      </span>
      <div class="attendee-list">
        {#each displayedAttendees as attendee, idx}
          <div class={getAttendeeClass(attendee, idx)}>
            <div class="default-avatar">
              <nylas-contact-image contact={attendee} />
            </div>
            <div class="contact-details">
              <span class="name">
                {`${attendee?.firstName ?? ""} ${attendee.lastName ?? ""}`}
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
        {#if selectedAttendees.length > _this.attendees_to_show}
          <span class="more-attendees">
            {`+${selectedAttendees.length - _this.attendees_to_show} more`}
          </span>
        {/if}
      </div>
    </div>
    {#if hasError}
      <nylas-message-error />
    {/if}
  </main>
{/if}
