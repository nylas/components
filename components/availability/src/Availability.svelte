<svelte:options tag="nylas-availability" />

<script lang="ts">
  import {
    formatTimeSlot,
    isValidTimezone,
    setTimeZoneOffset,
  } from "@commons/methods/convertDateTimeZone";
  import {
    ManifestStore,
    AvailabilityStore,
    ErrorStore,
    ConsecutiveAvailabilityStore,
  } from "../../../commons/src";
  import { handleError } from "@commons/methods/api";
  import { onMount, tick } from "svelte";
  import { get_current_component } from "svelte/internal";

  import {
    getEventDispatcher,
    buildInternalProps,
    arrayContainsArray,
  } from "@commons/methods/component";
  import type { TimeInterval } from "d3-time";
  import { timeWeek, timeDay, timeHour, timeMinute } from "d3-time";
  import { scaleTime, scaleLinear } from "d3-scale";
  import { lightenHexColour } from "@commons/methods/colour";
  import {
    SelectionStatus,
    AvailabilityStatus,
  } from "@commons/enums/Availability";

  import type {
    Manifest,
    TimeSlot,
    SelectableSlot,
    AvailabilityQuery,
    AvailabilityRule,
    Day,
    PreDatedTimeSlot,
    OpenHours,
    AvailabilityResponse,
  } from "@commons/types/Availability";
  import "@commons/components/ContactImage/ContactImage.svelte";
  import "@commons/components/ErrorMessage.svelte";
  import {
    getTimeString,
    getCondensedTimeString,
    showDateRange,
  } from "@commons/methods/datetime";
  import BackIcon from "./assets/left-arrow.svg";
  import NextIcon from "./assets/right-arrow.svg";
  import { isAvailable } from "./method/slot";
  import {
    buildOpenHours,
    convertHourAssumptionsToOpenHours,
  } from "./method/openhours";
  import type { EventDefinition } from "@commons/types/ScheduleEditor";
  import type { ConsecutiveEvent } from "@commons/types/Booking";
  import { generateDaySlots } from "./method/availabilityUtils";

  //#region props
  export let id: string = "";
  export let access_token: string = "";

  export let event_to_hover: ConsecutiveEvent[] | null = null;
  export let event_to_select: ConsecutiveEvent[] | null = null;

  export let allow_booking: boolean;
  export let allow_date_change: boolean;
  export let attendees_to_show: number;
  export let availability: AvailabilityResponse;
  export let booking_options: ConsecutiveEvent[][];
  export let booking_user_email: string;
  export let booking_user_token: string;
  export let busy_color: string;
  export let capacity: number | null;
  export let closed_color: string;
  export let date_format: "weekday" | "date" | "full" | "none";
  export let dates_to_show: number;
  export let end_hour: number;
  export let event_buffer: number;
  export let free_color: string;
  export let mandate_top_of_hour: boolean;
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
  export let start_date: Date | null;
  export let start_hour: number;
  export let timezone: string;
  export let view_as: "schedule" | "list";
  export let unavailable_color: string;
  export let events: EventDefinition[];

  const defaultValueMap: Partial<Manifest> = {
    allow_booking: false,
    allow_date_change: true,
    attendees_to_show: 5,
    busy_color: "#EE3248cc",
    calendars: [],
    closed_color: "#EE3248cc",
    date_format: "full",
    dates_to_show: 1,
    end_hour: 24,
    event_buffer: 0,
    free_color: "#078351cc",
    mandate_top_of_hour: false,
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
    unavailable_color: "#DDD",
    events: [],
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

  $: {
    if (
      _this.dates_to_show ||
      _this.show_ticks ||
      _this.show_as_week ||
      _this.show_weekends
    ) {
      // Changes to these props will resize the width of day container
      dayRef = dayRef.filter((day) => !!day);
    }
  }

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

    _this = buildInternalProps($$props, manifest, defaultValueMap) as Manifest;
    transformPropertyValues();

    loading = false;
  });

  let previousProps = $$props;
  $: {
    // TODO - Use a library to calculate the diff between props so that
    // only updated props are reassigned instead of rebuilding the whole object.
    if (
      ($$props.event_to_hover === undefined ||
        previousProps.event_to_hover === $$props.event_to_hover) &&
      JSON.stringify(previousProps) !== JSON.stringify($$props)
    ) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as Manifest;
      previousProps = $$props;
      transformPropertyValues();
    }
  }

  // Properties requiring further manipulation:
  function transformPropertyValues() {
    if (!_this.start_date) {
      _this.start_date = defaultValueMap.start_date;
    }

    if (_this.timezone) {
      if (!isValidTimezone(_this.timezone)) {
        console.warn(`Invalid IANA time zone: ${_this.timezone}`);
        _this.timezone = undefined;
      } else if (
        _this.timezone === Intl.DateTimeFormat().resolvedOptions().timeZone
      ) {
        _this.timezone = undefined;
      }
    }
  }

  $: (async () => {
    if (_this.booking_options) {
      consecutiveOptions = _this.booking_options;
    } else if (
      !loading &&
      id &&
      Array.isArray(_this.events) &&
      dayRange.length > 0
    ) {
      await buildConsecutiveOptions();
    }
    buildDailyConsecutiveOptions();
  })();

  //#endregion mount and prop initialization

  const dispatchEvent = getEventDispatcher(get_current_component());

  $: if (Object.keys($ErrorStore).length) {
    dispatchEvent("onError", $ErrorStore);
  }

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

  $: startDay =
    _this.show_as_week && !tooSmallForWeek
      ? timeWeek.floor(_this.start_date)
      : timeDay.floor(_this.start_date);

  $: endDay = dayRange[dayRange.length - 1];

  let maxBookAheadOffset: string;
  let minBookAheadOffset: string;

  $: maxBookAheadOffset = timeDay
    .offset(new Date(), _this.max_book_ahead_days)
    .toLocaleDateString();

  $: minBookAheadOffset = timeDay
    .offset(new Date(), _this.min_book_ahead_days)
    .toLocaleDateString();

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
    return slots
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
        let status = AvailabilityStatus.FREE;

        const numFreeCalendars = epoch[0].available_calendars.length;
        const fewerCalendarsThanRatio =
          numFreeCalendars !== allCalendars.length &&
          numFreeCalendars < allCalendars.length * partialBookableRatio;

        if (
          numFreeCalendars === 0 ||
          fewerCalendarsThanRatio ||
          (_this.required_participants.length &&
            //Check if every participants is included in the available calendar
            !arrayContainsArray(
              requiredParticipants,
              epoch[0].available_calendars,
            ))
        ) {
          if (epoch[0].availability === AvailabilityStatus.CLOSED) {
            status = AvailabilityStatus.CLOSED;
          } else {
            status = AvailabilityStatus.BUSY;
          }
        } else if (
          numFreeCalendars > 0 &&
          numFreeCalendars < allCalendars.length
        ) {
          status = AvailabilityStatus.PARTIAL;
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
      const availableSlotsForCalendar = slots.filter((slot) =>
        slot.available_calendars.includes(calendar.emailAddress),
      );
      if (
        slots.length - availableSlotsForCalendar.length >
        (_this.overbooked_threshold * slots.length) / 100
      ) {
        availableSlotsForCalendar.forEach((slot) => {
          slot.available_calendars = slot.available_calendars.filter(
            (cal) => cal !== calendar.emailAddress,
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
      generateDaySlots(
        timestamp,
        allCalendars,
        requiredParticipants,
        consecutiveOptions,
        consecutiveParticipants,
        _this,
      ),
    ); // TODO: include other potential post-all-slots-established checks, like overbooked, in a single secondary run here.

    return {
      epochs: generateEpochs(slots, _this.partial_bookable_ratio),
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
      let dispatchableSlots = sortedSlots;
      if (sortedSlots.length === 1) {
        if (selectedConsecutiveEventBlock.length) {
          dispatchableSlots = selectedConsecutiveEventBlock.map((event) => {
            event.available_calendars = event.emails; // slot.available_calendars is a little convoluted with freeCalendars above. TODO: refactor freeCalendars in generateDaySlots()
            return { ...sortedSlots[0], ...event };
          });
        } else {
          dispatchableSlots = dispatchableSlots.map((slot) => {
            return { ..._this.events[0], ...slot };
          });
        }
      }
      dispatchEvent("timeSlotChosen", {
        timeSlots: dispatchableSlots.map((slot) => Object.assign({}, slot)),
      });
      lastDispatchedSlots = sortedSlots;
    }
  }
  // #endregion timeSlot selection

  let consecutiveParticipants: string[] = [];
  let singleEventParticipants: string[] = [];

  $: if (_this.events?.length && _this.events?.length > 1) {
    consecutiveParticipants = _this.events?.flatMap((e) => e.participantEmails);
    singleEventParticipants = [];
    newCalendarTimeslotsForGivenEmails = [];
  } else if (_this.events?.length === 1) {
    singleEventParticipants = _this.events?.flatMap((e) => e.participantEmails);
    consecutiveParticipants = [];
    dispatchEvent("eventOptionsReady", {
      slots: [],
    });
  }

  function getAvailabilityQuery(
    emailAddresses = singleEventParticipants,
    accessToken = access_token,
  ): AvailabilityQuery {
    return {
      body: {
        emails: emailAddresses,
        free_busy: [],
        duration_minutes: 15, // minumum allowed duration/interval
        interval_minutes: 15,
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
    if (_this.availability) {
      // Need to wait a tick here to avoid race condition
      setTimeout(() => mapTimeslotsToCalendars(_this.availability));
    } else if (
      id &&
      ((Array.isArray(singleEventParticipants) &&
        singleEventParticipants.length > 0) ||
        (_this.booking_user_email && _this.booking_user_token)) &&
      _this.events?.length === 1
    ) {
      await getAvailability();
    }
  })();

  // If 2 slots bump up to each other consider them a single group of time
  function groupConsecutiveTimeslots(slots: PreDatedTimeSlot[] = []) {
    return slots.reduce((groups: PreDatedTimeSlot[], slot) => {
      const prevSlot = groups[groups.length - 1];
      if (prevSlot && prevSlot.end_time === slot.start_time) {
        prevSlot.end_time = slot.end_time;
      } else {
        groups.push({ ...slot });
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

    const calendarsToFetch: { email: string; token?: string }[] =
      singleEventParticipants.map((emailAddress) => {
        return {
          email: emailAddress,
        };
      });

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

      if (!_this.availability) {
        mapTimeslotsToCalendars(fetchedCalendars);
      }

      return newCalendarTimeslotsForGivenEmails;
    }
  }

  function mapTimeslotsToCalendars(calendarList: AvailabilityResponse) {
    const freeBusyCalendars: any = [];

    const timeSlotMap: Record<string, PreDatedTimeSlot[]> = {};

    for (const user of calendarList?.order) {
      timeSlotMap[user] = [];
    }

    for (const slot of calendarList.time_slots) {
      slot.emails.forEach((e) => timeSlotMap[e].push(slot));
    }

    calendarList?.order.forEach((user: any) => {
      freeBusyCalendars.push({
        emailAddress: user,
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
  }

  // Figure out if a given TimeSlot is the first one in a pending, or selected, block.
  function getBlockTimes(slot: SelectableSlot, day: Day) {
    const wrappingSortedSlot = sortedSlots.find(
      (block) => block.start_time === slot.start_time,
    );

    const precedingSlot: SelectableSlot =
      day.slots[day.slots.indexOf(slot) - 1];

    // A slot is first in a Pending block if:
    // it's pending
    // and it's not busy
    // and either:
    // the slot immediately before it isn't pending
    // OR
    // the slot immediately before it is busy
    const precedingSlotIsUnavailable = precedingSlot
      ? !isAvailable(precedingSlot)
      : false;

    if (
      slot.selectionPending &&
      isAvailable(slot) &&
      (!precedingSlot?.selectionPending || precedingSlotIsUnavailable)
    ) {
      const pendingEndTime =
        day.slots.find((daySlot) => {
          return (
            daySlot.start_time > slot.start_time &&
            (!daySlot.selectionPending || !isAvailable(daySlot))
          );
        })?.start_time || day.slots[day.slots.length - 1].end_time;
      const startTime = getCondensedTimeString(slot.start_time).replace(
        " ",
        "",
      );
      const endTime = getCondensedTimeString(pendingEndTime).replace(" ", "");
      return `${startTime} - ${endTime}`;
      // Otherwise, it's first in a selected block if its start_time matches a sortedSlot's start_time
    } else if (wrappingSortedSlot) {
      let startTime = getCondensedTimeString(wrappingSortedSlot.start_time);
      let endTime = getCondensedTimeString(wrappingSortedSlot.end_time);
      return `${startTime.replace(" ", "")} - ${endTime.replace(" ", "")}`;
    } else {
      return "";
    }
  }

  $: allCalendars = [
    // TODO: consider merging these 2 into just calendars
    ...newCalendarTimeslotsForGivenEmails,
    ...consecutiveParticipants.map((email) => {
      return {
        emailAddress: email,
        availability: AvailabilityStatus.FREE,
        timeslots: [],
      };
    }),
  ];

  // #region Date Change
  function goToNextDate() {
    if (_this.show_as_week && !tooSmallForWeek) {
      _this.start_date = timeWeek.offset(endDay, 1);
    } else {
      _this.start_date = timeDay.offset(endDay, 1);
    }
    // On date change, dispatch an empty list to let parent app trigger a loading state
    dispatchEvent("eventOptionsReady", {
      slots: [],
    });
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
    // On date change, dispatch an empty list to let parent app trigger a loading state
    dispatchEvent("eventOptionsReady", {
      slots: [],
    });
  }

  // Track and dispatch active dates whenever they change
  let canonicalDates: Date[] = [];
  $: if (
    JSON.stringify(canonicalDates) !==
    JSON.stringify(days.map((day) => day.timestamp))
  ) {
    canonicalDates = days.map((day) => day.timestamp);
    dispatchEvent("dateChange", {
      dates: canonicalDates,
    });
  }

  // #endregion Date Change

  //#region slot selection
  // Click action for un-draggable slot-list buttons (list view)
  function toggleSlot(slot: SelectableSlot) {
    if (slot.selectionStatus === SelectionStatus.SELECTED) {
      event_to_select = null;
    } else {
      event_to_select = inspectConsecutiveBlock(slot);
    }

    // Deselect any others
    days
      .flatMap((d) => d.slots)
      .forEach((slot) => {
        slot.selectionPending = false;
        slot.selectionStatus = SelectionStatus.UNSELECTED;
      });

    days = [...days];
    event_to_hover = null;
  }
  //#endregion dragging

  //#region slot interaction handlers
  function handleSlotInteractionStart(slot: TimeSlot) {
    if (slot) {
      // Deselect any others
      days
        .flatMap((d) => d.slots)
        .forEach((slot) => {
          slot.selectionPending = false;
          slot.selectionStatus = SelectionStatus.UNSELECTED;
        });

      if (event_to_select === inspectConsecutiveBlock(slot)) {
        event_to_select = null;
        days = [...days];
      } else {
        event_to_select = inspectConsecutiveBlock(slot);
      }
    }
  }

  function handleSlotHover(hoveredSlot: TimeSlot) {
    if (hoveredSlot) {
      event_to_hover = inspectConsecutiveBlock(hoveredSlot);
    }
  }

  //#endregion slot interaction handlers

  // #region error
  $: if (id && consecutiveParticipants.length && _this.capacity) {
    try {
      handleError(id, {
        name: "IncompatibleProperties",
        message:
          "Setting `capacity` currently does not work when fetching availability directly from Nylas. Please pass `calendars` data directly to use `capacity`.",
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
        if (elemIndex >= 0) {
          slotRef[params.dateKey].splice(elemIndex, 1);
        }
        if (slotRef[params.dateKey].length === 0) {
          dayOrder = dayOrder.filter((day) => day !== params.dateKey);
          delete slotRef[params.dateKey];
        }
      },
    };
  }

  //#region colours
  // Show partial availability as a gradient, rather than as categorically "partial"
  $: partialScale = scaleLinear<string>()
    .domain([0, allCalendars.length / 2, allCalendars.length])
    .range([_this.busy_color, _this.partial_color, _this.free_color]);
  //#endregion colours

  //#region Consecutive Events
  // If manifest.events.length > 1, fetch consecutive events and emit them for <nylas-booking> or parent app to pick up.
  let consecutiveOptions: ConsecutiveEvent[][] = [];
  let dailyConsecutiveOptions: Record<string, ConsecutiveEvent[][]> = {};

  async function buildConsecutiveOptions() {
    // the availability/consecutive endpoint eagerly returns open timeslots;
    // establish open hours so the user isn't overburdened with the horrible freedom of choice.
    let openHours: OpenHours[] = [];
    if (_this.open_hours.length) {
      // TODO: conversion from component open hours format to Nylas events open hours format
      // openHours = _this.open_hours;

      openHours = buildOpenHours(_this.open_hours, _this.events);
    } else if (_this.start_hour && _this.end_hour) {
      // We can build an open hours array in the Nylas format from assumptions given start_hour and end_hour
      openHours = convertHourAssumptionsToOpenHours(
        _this.start_hour,
        _this.end_hour,
        _this.events,
      );
    }

    const consecutiveSlotsQueryKey = await createConsecutiveQueryKey(
      _this.events,
      dayRange,
      _this.end_hour,
      openHours,
    );

    if (
      consecutiveSlotsQueryKey?.start_time < consecutiveSlotsQueryKey?.end_time
    ) {
      consecutiveOptions = await $ConsecutiveAvailabilityStore[
        JSON.stringify({
          body: consecutiveSlotsQueryKey,
          component_id: id,
          access_token,
        })
      ];
    } else {
      consecutiveOptions = [];
    }

    // emit the awaited events list
    dispatchEvent("eventOptionsReady", {
      slots: consecutiveOptions,
    });
  }

  function buildDailyConsecutiveOptions() {
    dailyConsecutiveOptions = {};

    for (const option of consecutiveOptions) {
      if (!option[0]?.start_time) {
        continue;
      }

      const day = new Date(
        new Date(option[0].start_time).setHours(0, 0, 0, 0),
      ).getTime();
      if (dailyConsecutiveOptions[day]) {
        dailyConsecutiveOptions[day].push(option);
      } else {
        dailyConsecutiveOptions[day] = [option];
      }
    }
  }

  function createConsecutiveQueryKey(
    events: EventDefinition[],
    dayRange: Date[],
    endHour: number,
    openHours: OpenHours[],
  ) {
    if (events.length === 0) {
      return;
    }

    const endDay = dayRange[dayRange.length - 1];

    const emailsList = events.reduce(
      (emails: string[][], event: EventDefinition) => {
        emails.push(event.participantEmails);
        return emails;
      },
      [],
    );
    // Pick the duration_minutes from the first block slot
    // TODO: Need to be updated when API can handle different slot size per meeting
    const duration_minutes = events[0].slot_size;
    const eventDetails = {
      duration_minutes,
      interval_minutes: _this.slot_size,
      start_time: Math.floor(new Date().getTime() / 1000),
      end_time:
        timeHour(new Date(new Date(endDay).setHours(endHour))).getTime() / 1000,
      free_busy: <any[]>[],
      open_hours: openHours,
      emails: emailsList,
      events,
      round_robin: "max-fairness",
    };
    return eventDetails;
  }

  // React to hovered events; respond by highlighting slots
  $: if (event_to_hover) {
    days
      .flatMap((day) => day.slots)
      .forEach((slot) => {
        slot.selectionPending =
          slot.start_time >= event_to_hover[0].start_time &&
          slot.end_time <= event_to_hover[event_to_hover.length - 1].end_time;
      });
    days = [...days];
  }

  let selectedConsecutiveEventBlock: ConsecutiveEvent[] = [];

  $: if (event_to_select) {
    selectedConsecutiveEventBlock = event_to_select;
    days
      .flatMap((d) => d.slots)
      .filter((slot) => {
        return (
          event_to_select &&
          slot.start_time >= event_to_select[0].start_time &&
          slot.end_time <= event_to_select[event_to_select.length - 1].end_time
        );
      })
      .forEach((slot) => {
        slot.selectionPending = false;
        slot.selectionStatus = SelectionStatus.SELECTED;
      });
    days = [...days];
  }

  // Expand hovered / clicked time slots to show the full consecutive event span
  function inspectConsecutiveBlock(slot: TimeSlot) {
    if (!slot.fallsWithinAllowedTimeRange) {
      return null;
    }

    const day = new Date(
      new Date(slot.start_time).setHours(0, 0, 0, 0),
    ).getTime();

    const consecutiveBlocks =
      dailyConsecutiveOptions[day]?.filter((block) => {
        return (
          slot.start_time >= block[0].start_time &&
          slot.end_time <= block[block.length - 1].end_time
        );
      }) ?? [];

    // Use last block so that consecutive blocks always flow downwards
    // Sorting isn't needed since API responds with options sorted by start_date
    return consecutiveBlocks[consecutiveBlocks.length - 1];
  }

  // Consecutive Events present a challenge for List View; where we typically show a slot for every slot_size,
  // a user can only book several in a row. We should, therefore, only show those slots that exist within a consecutive series
  $: listViewOptions = (day: Day): SelectableSlot[] => {
    return day.slots.filter((slot) => inspectConsecutiveBlock(slot));
  };

  //#endregion Consecutive Events
</script>

<style lang="scss">
  @import "./styles/availability.scss";
</style>

{#if manifest && manifest.error}
  <nylas-error {id} />
{:else}
  <main
    bind:this={main}
    bind:clientHeight
    class:ticked={_this.show_ticks && _this.view_as === "schedule"}
    class:timezone={_this.timezone}
    class:allow_booking={_this.allow_booking}
    class:hide-header={!_this.show_header}
    on:mouseleave={() => (event_to_hover = null)}
    style="
    --busy-color-lightened: {lightenHexColour(_this.busy_color, 90)};
    --closed-color-lightened: {lightenHexColour(_this.closed_color, 90)};
    --selected-color-lightened: {lightenHexColour(_this.selected_color, 60)};
    --free-color: {_this.free_color}; --busy-color: {_this.busy_color};
    --closed-color: {_this.closed_color}; --partial-color: {_this.partial_color};
    --selected-color: {_this.selected_color};
    --unavailable-color: {_this.unavailable_color}">
    <header class:dated={_this.allow_date_change}>
      <h2 class="month">{showDateRange(days)}</h2>
      {#if _this.allow_date_change}
        <div class="change-dates">
          {#if !dayOrder.includes(minBookAheadOffset)}
            <button on:click={goToPreviousDate} aria-label="Previous date">
              <BackIcon style="height:32px;width:32px;" />
            </button>
          {:else}
            <span />
          {/if}

          {#if !dayOrder.includes(maxBookAheadOffset)}
            <button on:click={goToNextDate} aria-label="Next date">
              <NextIcon style="height:32px;width:32px;" />
            </button>
          {:else}
            <span />
          {/if}
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
      bind:clientWidth={dayContainerWidth}>
      {#each days as day, dayIndex (day.timestamp.toISOString())}
        <div
          class="day"
          data-timestamp={day.timestamp.toISOString()}
          bind:this={dayRef[dayIndex]}>
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
                  data-end-time={new Date(epoch.end_time).toLocaleString()}>
                  <div
                    class="inner"
                    style="background-color: {partialScale(
                      epoch.available_calendars.length,
                    )}" />
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
                  class:pending={event_to_hover && slot.selectionPending}
                  data-start-time={new Date(slot.start_time).toLocaleString()}
                  data-end-time={new Date(slot.end_time).toLocaleString()}
                  class:outside-of-time-range={!slot.fallsWithinAllowedTimeRange}
                  title={slot.fallsWithinAllowedTimeRange
                    ? null
                    : `You may only select timeslots in the future, between ${minBookAheadOffset} and ${maxBookAheadOffset}`}
                  on:click={() => {
                    handleSlotInteractionStart(slot);
                  }}
                  on:mouseenter={() => {
                    handleSlotHover(slot);
                  }}>
                  {#if slot.selectionStatus === SelectionStatus.SELECTED || (event_to_hover && getBlockTimes(slot, day))}
                    <span class="selected-heading"
                      >{getBlockTimes(slot, day)}</span>
                  {/if}
                </button>
              {/each}
            </div>
          {:else if _this.view_as === "list"}
            <div class="slot-list">
              {#each listViewOptions(day) as slot}
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
                  on:click={() => toggleSlot(slot)}>
                  {getTimeString(new Date(slot.start_time))}
                  {#if slot.availability === AvailabilityStatus.PARTIAL}
                    <span class="partial">
                      ({slot.available_calendars.length} of {allCalendars.length}
                      available)
                    </span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
    {#if hasError}
      <nylas-message-error />
    {/if}
  </main>
{/if}
