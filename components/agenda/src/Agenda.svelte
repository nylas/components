<svelte:options tag="nylas-agenda" immutable={true} />

<script lang="ts">
  import { tick } from "svelte";
  import { get_current_component, onMount } from "svelte/internal";
  import { spring } from "svelte/motion";
  import { CalendarStore, EventStore, ManifestStore } from "@commons";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import type { EventPosition } from "./methods/position";
  import { populatePositionMap, updateEventPosition } from "./methods/position";
  import { getDynamicEndTime, getDynamicStartTime } from "./methods/time";
  import type { AgendaProperties } from "@commons/types/Nylas";

  import type {
    EventQuery,
    Event,
    CalendarQuery,
    Calendar,
    TimespanEvent,
    DateEvent,
  } from "@commons/types/Events";

  // #region props
  const INTERNAL_EVENT_PROPS = Object.freeze([
    "overlaps",
    "relativeOverlapOffset",
    "relativeOverlapWidth",
    "relativeRunTime",
    "relativeStartTime",
  ]);
  let manifest: Partial<AgendaProperties> = {};

  export let id: string = "";
  export let access_token: string = "";

  export let allow_date_change: boolean;
  export let allow_event_creation: boolean;
  export let allowed_dates: Date[] | string = [];
  export let auto_time_box: boolean;
  export let events: Event[] | null = null;
  export let calendar_id: string = "";
  export let calendar_ids: any = "";
  export let click_action: (
    event: MouseEvent | KeyboardEvent,
    calendarEvent: Event,
  ) => any;
  export let color_by: string;
  export let condensed_view: boolean | string;
  export let eagerly_fetch_events: boolean;
  export let event_snap_interval: number;
  export let event_created: (
    event: Event,
    confirm: (event: TimespanEvent) => void,
    cancel: () => void,
    updateEvent: (event: TimespanEvent) => void,
  ) => any;
  export let header_type: "full" | "day" | "none";
  export let hide_all_day_events: boolean;
  export let hide_current_time: boolean;
  export let hide_ticks: boolean;
  export let prevent_zoom: boolean;
  export let selected_date: Date | null = null;
  export let show_no_events_message: boolean;
  export let theme: string;

  const defaultValueMap = {
    allow_date_change: false,
    allow_event_creation: false,
    auto_time_box: false,
    calendar_ids: "",
    color_by: "calendar",
    condensed_view: false,
    header_type: "full",
    hide_current_time: false,
    hide_all_day_events: false,
    prevent_zoom: false,
    show_no_events_message: false,
    eagerly_fetch_events: true,
    event_snap_interval: 15,
    theme: "theme-1",
    hide_ticks: false,
  };

  let internalProps: AgendaProperties = <any>{};
  let now = new Date().getTime();

  onMount(async () => {
    await tick();
    clientHeight = agendaElement?.getBoundingClientRect().height;
    manifest = ((await $ManifestStore[
      JSON.stringify({ component_id: id, access_token })
    ]) || {}) as AgendaProperties;
    updateInternalProps(
      buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as AgendaProperties,
    );

    setInterval(() => {
      now = new Date().getTime();
    }, 15000);
  });

  const dispatchEvent = getEventDispatcher(get_current_component());

  $: dispatchEvent("manifestLoaded", manifest);

  $: {
    const rebuiltProps = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as AgendaProperties;
    if (JSON.stringify(rebuiltProps) !== JSON.stringify(internalProps)) {
      updateInternalProps(rebuiltProps);
    }
  }

  function updateInternalProps(updatedProps: AgendaProperties) {
    internalProps = updatedProps;

    allow_date_change = internalProps.allow_date_change;
    allow_event_creation = internalProps.allow_event_creation;
    auto_time_box = internalProps.auto_time_box;
    calendar_ids = internalProps.calendar_ids;
    color_by = internalProps.color_by;
    condensed_view = internalProps.condensed_view;
    header_type = internalProps.header_type;
    hide_current_time = internalProps.hide_current_time;
    hide_all_day_events = internalProps.hide_all_day_events;
    prevent_zoom = internalProps.prevent_zoom;
    show_no_events_message = internalProps.show_no_events_message;
    eagerly_fetch_events = internalProps.eagerly_fetch_events;
    event_snap_interval = internalProps.event_snap_interval;
    theme = internalProps.theme;
    hide_ticks = internalProps.hide_ticks;
  }

  let themeUrl: string;
  $: if (!!theme && (theme.startsWith(".") || theme.startsWith("http"))) {
    // If the theme is a file path or a URL
    themeUrl = theme;
  }

  $: click_default = typeof click_action === "function" ? "none" : "expand";

  // This is only configurable via the manifest
  $: show_as_busy =
    manifest && typeof manifest["show_as_busy"] !== "undefined"
      ? manifest["show_as_busy"]
      : false;

  // #endregion props

  // #region time constants
  let selectedDate: Date;
  $: selectedDate = (() => {
    if (selected_date) {
      const date = convertToUTC(new Date(selected_date));
      date.setHours(0, 0, 0, 0);
      return date;
    } else if (allowedDates.length) {
      return allowedDates[0];
    } else {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    }
  })();

  function convertToUTC(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  $: hideCurrentTime =
    hide_current_time ||
    new Date().toLocaleDateString() != selectedDate.toLocaleDateString();

  $: allowedDates = (() => {
    let dates: Date[] = [];

    if (allowed_dates && typeof allowed_dates === "string") {
      if (allowed_dates.includes(",")) {
        dates = allowed_dates.split(",").map((date): Date => new Date(date));
      } else {
        dates = [new Date(allowed_dates)];
      }

      dates = dates.map((date: Date) => {
        date.setHours(0, 0, 0, 0);
        return date;
      });
    }

    if (allowed_dates && typeof allowed_dates !== "string") {
      dates = allowed_dates;
    }

    return dates;
  })();

  // Minutes of the day. Used to display the top and bottom of an agenda.
  export let start_minute = 0;
  export let end_minute = 1440;

  // get events from story by unique ID with Calendar and Date

  $: startMinute =
    auto_time_box && timespanEvents?.length
      ? getDynamicStartTime(timespanEvents[0])
      : start_minute;

  $: endMinute =
    auto_time_box && timespanEvents?.length
      ? getDynamicEndTime(timespanEvents[timespanEvents.length - 1])
      : end_minute;

  $: startTime = (() => {
    let date = new Date();
    date.setHours(0, startMinute, 0, 0);
    return date;
  })();

  $: endTime = (() => {
    let date = new Date();
    date.setHours(0, endMinute, 0, 0);
    return date;
  })();

  let timeSpan: number;
  $: timeSpan = Math.floor(endMinute - startMinute);

  let startOfDay: number;
  let endOfDay: number;

  $: startOfDay =
    new Date(new Date(selectedDate).setHours(0, 0, 0, 0)).getTime() / 1000;
  $: endOfDay =
    new Date(new Date(selectedDate).setHours(24, 0, 0, 0)).getTime() / 1000;

  // #endregion time constants

  // #region Data Flow

  // Accept either comma-separated string, or array.
  let calendarIDs: string[] = [];
  $: (calendarIDs = setCalendarIDs()), internalProps, calendar_id;
  function setCalendarIDs() {
    let IDList = internalProps.calendar_ids;
    if (typeof IDList === "string" && IDList.length) {
      return IDList.split(",").map((id: string) => id.trim());
    } else if (calendar_id) {
      return [calendar_id];
    }
    return [];
  }

  let query: EventQuery;
  $: query = {
    component_id: id,
    access_token: access_token,
    calendarIDs: calendarIDs,
    starts_after: startOfDay,
    ends_before: endOfDay,
  };

  // Sibling Queries: eagerly fetch the events on the previous and next days,
  // so when the user clicks them, the loading will seem instantaneous.
  let siblingQueries: [EventQuery, EventQuery] | [] = [];
  $: if (allow_date_change && eagerly_fetch_events && query) {
    let previousDate;
    let nextDate;
    if (allowedDates.length) {
      const dateSpot = allowedDates.findIndex(
        (date: Date) => date.toDateString() === selectedDate.toDateString(),
      );
      previousDate = allowedDates[dateSpot - 1] || selectedDate;
      nextDate = allowedDates[dateSpot + 1] || selectedDate;
    } else {
      previousDate = new Date(new Date().setDate(selectedDate.getDate() - 1));
      nextDate = new Date(new Date().setDate(selectedDate.getDate() + 1));
    }

    siblingQueries = [
      {
        component_id: id,
        access_token: access_token,
        calendarIDs: calendarIDs,
        starts_after:
          new Date(new Date(previousDate).setHours(0, 0, 0, 0)).getTime() /
          1000,
        ends_before:
          new Date(new Date(previousDate).setHours(24, 0, 0, 0)).getTime() /
          1000,
      },
      {
        component_id: id,
        access_token: access_token,
        calendarIDs: calendarIDs,
        starts_after:
          new Date(new Date(nextDate).setHours(0, 0, 0, 0)).getTime() / 1000,
        ends_before:
          new Date(new Date(nextDate).setHours(24, 0, 0, 0)).getTime() / 1000,
      },
    ];
  }

  let queryKey: string;
  $: queryKey = JSON.stringify(query);

  let calendars: Calendar[] = [];
  $: (async () => {
    if (id && calendarIDs.length) {
      const calendarQuery: CalendarQuery = {
        access_token,
        component_id: id,
        calendarIDs,
      };
      calendars = await CalendarStore.getCalendars(calendarQuery);
    }
  })();

  // Try getting events from 3 sources: first, directly passed in, then, from our store; finally, by way of a fetch
  let calendarEvents: Event[] = [];
  $: setCalendarEvents(), events, query;
  async function setCalendarEvents() {
    if (events && Array.isArray(events)) {
      calendarEvents = events as Event[];
    } else {
      await EventStore.getEvents(query).then((nylasEvents) => {
        if (!events) {
          calendarEvents = nylasEvents || [];
          if (siblingQueries.length) {
            siblingQueries.forEach((siblingQuery) =>
              EventStore.getEvents(siblingQuery),
            );
          }
        }
      });
    }
  }

  $: allDayEvents = calendarEvents
    ?.filter((event): event is DateEvent => "date" in event.when)
    ?.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

  $: timespanEvents = calendarEvents
    ?.filter((event): event is TimespanEvent => "start_time" in event.when)
    ?.map((event: TimespanEvent) => {
      let attendee = calendars.find((cal) => cal.id === event.calendar_id);
      event.attendeeStatus = event.participants?.find(
        (p) => p.email === attendee?.name,
      )?.status;
      return event;
    })
    .sort((a, b) => a.when.start_time - b.when.start_time);

  // Only fired if no events prop was passed in
  $: if (!events) {
    dispatchEvent("eventsLoaded", calendarEvents);
  }

  // Don't let events be smaller than 30px tall; if they would be, overflow the calendar and make it scrollable.
  const minEventHeight = 30;
  let overflowing = false;
  $: overflowing = hydratedEvents.length * minEventHeight > clientHeight;
  $: {
    if (condensed && overflowing) {
      hydratedEvents.forEach((event, iter) => {
        event.relativeStartTime = minEventHeightPercent * iter;
        event.relativeRunTime = minEventHeightPercent;
      });
    }
  }
  $: minEventHeightPercent = minEventHeight / clientHeight;

  let eventSource: Event[];
  $: eventSource =
    Array.isArray(calendarEvents) && calendarEvents.length > 0
      ? calendarEvents
      : events || [];
  // calendarEvents, but with presentational changes made to content.
  // (figure out how far down the page an event needs to be positioned, render links as links, etc.)
  // Goal timing: 0.02ms per event or less
  let hydratedEvents: Event[] = [];
  $: {
    if (events || (timespanEvents && calendars?.length)) {
      hydratedEvents = eventSource
        .filter(
          (event: Event): event is TimespanEvent =>
            event.status !== "cancelled" && "start_time" in event.when,
        )
        .map((event: TimespanEvent, iter) => {
          if (condensed) {
            event.relativeStartTime =
              (100 / timespanEvents.length / 100) * iter;
            event.relativeRunTime = 100 / timespanEvents.length / 100;
            return event;
          }

          let minutesInVisibleDay =
            new Date(event.when.start_time * 1000).getTime() -
            new Date(
              new Date(event.when.start_time * 1000).setHours(
                0,
                startMinute,
                0,
                0,
              ),
            ).getTime();
          minutesInVisibleDay = minutesInVisibleDay / 60000; // in minutes

          let runTime =
            new Date(event.when.end_time * 1000).getTime() -
            new Date(event.when.start_time * 1000).getTime();
          runTime = runTime / 60000; // in minutes

          event.relativeStartTime = minutesInVisibleDay / timeSpan;
          event.relativeRunTime = runTime / timeSpan;

          // location as meeting? let's fix that!
          if (event.location?.startsWith("http")) {
            event.locationString = `Link: ${new URL(event.location).hostname}`;
          }
          return event;
        });

      const hydratedTimespans: TimespanEvent[] = hydratedEvents.filter(
        (event): event is TimespanEvent =>
          "start_time" in event.when && "end_time" in event.when,
      );

      if (!condensed) {
        // Event Overlap detection and positioning
        const positionMap: Record<string, EventPosition> = {};
        populatePositionMap(hydratedTimespans, positionMap);

        hydratedTimespans
          // Ensure longer events are processed first, so they can be placed as far left as possible
          .sort((a, b) =>
            a.when.end_time - a.when.start_time <
            b.when.end_time - b.when.start_time
              ? 1
              : -1,
          )
          .forEach((event) => updateEventPosition(event, positionMap));
      } else {
        hydratedTimespans.forEach((event) => {
          event.relativeOverlapWidth = 1;
          event.relativeOverlapOffset = 0;
        });
      }
    } else if ($EventStore[queryKey]) {
      // if there's a store entry but it's empty, it means you've fetched and there's nothing.
      hydratedEvents = [];
    }
  }

  // #endregion Data Flow

  // #region date selection

  let dateIsFirstAllowed: boolean;
  $: dateIsFirstAllowed = !!(
    allowedDates.length &&
    allowedDates.findIndex(
      (date: Date) => date.toDateString() === selectedDate.toDateString(),
    ) === 0
  );

  let dateIsLastAllowed: boolean;
  $: dateIsLastAllowed = !!(
    allowedDates.length &&
    allowedDates.findIndex(
      (date: Date) => date.toDateString() === selectedDate.toDateString(),
    ) ===
      allowedDates.length - 1
  );

  const goToNextDate = () => {
    if (isCreatingNewEvent) {
      return;
    }

    if (allowedDates.length) {
      const dateSpot = allowedDates.findIndex(
        (date: Date) => date.toDateString() === selectedDate.toDateString(),
      );
      selectedDate = allowedDates[dateSpot + 1] || selectedDate;
    } else {
      selectedDate = new Date(new Date().setDate(selectedDate.getDate() + 1));
    }
    dispatchEvent(
      "dateChange",
      new Date(new Date(selectedDate).setHours(0, 0, 0, 0)),
    );
  };
  const goToPreviousDate = () => {
    if (isCreatingNewEvent) {
      return;
    }

    if (allowedDates.length) {
      const dateSpot = allowedDates.findIndex(
        (date: Date) => date.toDateString() === selectedDate.toDateString(),
      );
      selectedDate = allowedDates[dateSpot - 1] || selectedDate;
    } else {
      selectedDate = new Date(new Date().setDate(selectedDate.getDate() - 1));
    }
    dispatchEvent(
      "dateChange",
      new Date(new Date(selectedDate).setHours(0, 0, 0, 0)),
    );
  };
  // #endregion date selection

  // #region position and zoom
  $: ticks = [...Array(24).keys()].map((key) => {
    const date = new Date();
    date.setHours(key, 0, 0, 0);

    let minutesInVisibleDay = endTime.getTime() - startTime.getTime();
    minutesInVisibleDay = minutesInVisibleDay / 60000; // in minutes

    return {
      key,
      formatted: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      }), // "9 AM"
      timeString: date.toISOString(),
      timeStamp: date.getTime(),
      date,
      // relativeTickPosition: a 0-1 representation of how far along the y-axis each tick should live.
      relativeTickPosition:
        (date.getTime() - startTime.getTime()) / 60000 / minutesInVisibleDay,
    };
  });

  $: currentTimePosition = () => {
    const date = new Date(now); // seems redundant, right? new Date() does the same thing. But, the inclusion of "now" means that changes to it are observed -- and we change every setInterval loop.

    const minutesInDayBeforeNow =
      (date.getTime() - startTime.getTime()) / 60000;

    const minutesInVisibleDay =
      (endTime.getTime() - startTime.getTime()) / 60000;

    return (minutesInDayBeforeNow / minutesInVisibleDay) * 100;
  };

  let agendaElement: Element;
  let clientHeight: number;

  $: condensed = condensed_view || (clientHeight && clientHeight < 500);

  let scrolling = false;

  const handleWheel = (event: WheelEvent) => {
    if (expandedEventId) {
      return;
    }

    scrolling = true;
    setTimeout(() => {
      scrolling = false;
    }, 500);
    event.preventDefault();
    const canvas = agendaElement.getBoundingClientRect();
    const mouseYPosition = event.clientY - canvas.top;
    let velocity = Math.abs(event.deltaY) / 10;

    // ctrlKey = Pinch-to-zoom
    if (event.ctrlKey) {
      event.preventDefault();
      velocity *= 20;
    }

    const direction = event.deltaY >= 0 ? "out" : "in";

    // zoom TO your mouse position, not just the midpoint
    // creates a tuple representing how far downt he element you are;
    // so 65% down the element would be [0.65, 0.35]
    const ratio = [
      mouseYPosition / canvas.height,
      (canvas.height - mouseYPosition) / canvas.height,
    ];

    if (direction === "out") {
      if (endMinute <= 1440 && endMinute + velocity <= 1440) {
        endMinute += velocity;
      } else {
        endMinute = 1440;
      }
      if (startMinute >= 0 && startMinute - velocity >= 0) {
        startMinute -= velocity;
      } else {
        startMinute = 0;
      }
    }

    if (direction === "in") {
      // dont enter the upside-down, you'll encounter the demogorgon
      if (endMinute > startMinute + 60) {
        // max-zoom: 60 minutes
        startMinute += velocity * ratio[0];
        endMinute -= velocity * ratio[1];
      }
    }
  };

  // #endregion position and zoom

  // #region event handlers
  let expandedEventId: string = "";
  let lastStartMinute: number;
  let lastEndMinute: number;

  function eventClicked(
    event: MouseEvent | KeyboardEvent,
    calendarEvent: Event,
  ) {
    if (typeof click_action === "function") {
      const clonedEvent = JSON.parse(JSON.stringify(calendarEvent));
      for (const internalProp of INTERNAL_EVENT_PROPS) {
        delete clonedEvent[internalProp];
      }
      click_action(event, clonedEvent);
    }

    if (click_default === "expand" && "start_time" in calendarEvent.when) {
      if (calendarEvent.id !== expandedEventId) {
        lastStartMinute = startMinute;
        lastEndMinute = endMinute;
        startMinute = getDynamicStartTime(calendarEvent);
        endMinute = getDynamicEndTime(calendarEvent);
        expandedEventId = calendarEvent.id;
      } else {
        expandedEventId = "";
        startMinute = lastStartMinute;
        endMinute = lastEndMinute;
      }
    }
  }

  let dragState = { held: false, x: 0, y: 0 };
  let stiffness = 0.2;
  let damping = 0.7;
  const dampener = spring(
    { x: 0 },
    {
      stiffness,
      damping,
    },
  );
  $: if (dragState.x === 0) dampener.set({ x: 0 });
  const MIN_DRAG_DISTANCE = 50;
  const CLICK_ENABLED_AFTER = 100;

  function headerMouseDown(event: PointerEvent) {
    dragState = { held: true, x: event.clientX, y: event.clientY };
    dampener.stiffness = 1;
    dampener.damping = 1;
  }

  function headerMouseMove(event: PointerEvent) {
    if (dragState.held) {
      dampener.update(() => ({
        x:
          Math.sign(event.clientX - dragState.x) *
          Math.sqrt(Math.abs(event.clientX - dragState.x)),
      }));
    }
  }

  function headerMouseUp(event: PointerEvent) {
    if (dragState.held) {
      let distance = event.clientX - dragState.x;
      if (Math.abs(distance) > MIN_DRAG_DISTANCE && allow_date_change) {
        // you've been moving, not clicking.
        if (distance > 0) {
          goToPreviousDate();
        } else if (distance < 0) {
          goToNextDate();
        }
        setTimeout(() => {
          dragState = { held: false, x: 0, y: 0 };
        }, CLICK_ENABLED_AFTER);
      } else {
        dragState = { held: false, x: 0, y: 0 };
      }
    }
    dampener.stiffness = stiffness;
    dampener.damping = damping;
    dampener.set({ x: 0 });
  }

  function snapStartTimeToTimespanInterval(yPosition: number) {
    // Calculate start time & adjust for current zoom
    const relativeStartTime =
      Math.abs(yPosition - agendaElement.getBoundingClientRect().y) /
      agendaElement.getBoundingClientRect().height;
    const zoomAdjustedStartTime = timeSpan * relativeStartTime + startMinute;

    // Round to nearest snap interval & convert back to relative position
    const snappedStartTime =
      Math.round(zoomAdjustedStartTime / event_snap_interval) *
      event_snap_interval;
    return (snappedStartTime - startMinute) / timeSpan;
  }

  function snapRunTimeToTimespanInterval(yPosition: number) {
    // Calculate start time & adjust for current zoom
    const relativeRunTime =
      Math.abs(yPosition - dragState.y) /
      agendaElement.getBoundingClientRect().height;
    const zoomAdjustedRunTime = timeSpan * relativeRunTime;

    // Round to nearest snap interval & convert back to relative position
    const snappedRunTime =
      Math.round(zoomAdjustedRunTime / event_snap_interval) *
      event_snap_interval;
    return snappedRunTime / timeSpan;
  }

  let newEvent: TimespanEvent | null;
  let isCreatingNewEvent = false;
  function agendaMouseDown(event: PointerEvent) {
    if (
      allow_event_creation &&
      !isCreatingNewEvent &&
      Array.isArray(eventSource)
    ) {
      dragState = { held: true, x: event.clientX, y: event.clientY };
      newEvent = <any>{
        id: `${eventSource.length}`,
        title: "New Event",
        relativeStartTime: snapStartTimeToTimespanInterval(event.clientY),
        relativeRunTime: 0,
        relativeOverlapWidth: 1,
        when: <any>{},
        isNewEvent: true,
      };
      isCreatingNewEvent = true;
    }
  }

  let negativeDragStartPosition: number | null = null;
  function agendaMouseMove(event: PointerEvent) {
    if (
      allow_event_creation &&
      dragState.held &&
      !!newEvent &&
      event.clientY > agendaElement.getBoundingClientRect().y
    ) {
      if (dragState.y <= event.clientY) {
        // If the drag is downward, update the event's runtime
        if (negativeDragStartPosition !== null) {
          newEvent.relativeStartTime = negativeDragStartPosition;
          negativeDragStartPosition = null;
        }
        newEvent.relativeRunTime = snapRunTimeToTimespanInterval(event.clientY);
      } else {
        // If the drag is upward, update both the event's start time and runtime
        if (negativeDragStartPosition === null) {
          negativeDragStartPosition = newEvent.relativeStartTime;
        }
        newEvent.relativeStartTime = snapStartTimeToTimespanInterval(
          event.clientY,
        );
        newEvent.relativeRunTime = Math.abs(
          negativeDragStartPosition - newEvent.relativeStartTime,
        );
      }
      // Ensure event height is updated in the DOM
      newEvent = { ...newEvent };
    }
  }

  function agendaMouseUp() {
    if (
      allow_event_creation &&
      dragState.held &&
      newEvent &&
      newEvent.relativeRunTime > 0
    ) {
      const zoomAdjustedStartTime =
          timeSpan * newEvent.relativeStartTime + startMinute,
        zoomAdjustedRunTime = timeSpan * newEvent.relativeRunTime;

      const currentDate = new Date(selectedDate);
      newEvent.when.start_time = Math.floor(
        new Date(
          currentDate.setHours(0, zoomAdjustedStartTime, 0, 0),
        ).getTime() / 1000,
      );
      newEvent.when.end_time = Math.floor(
        new Date(
          currentDate.setHours(
            0,
            zoomAdjustedStartTime + zoomAdjustedRunTime,
            0,
            0,
          ),
        ).getTime() / 1000,
      );
      eventSource = [...eventSource, newEvent];

      if (
        typeof event_created === "function" &&
        Array.isArray(calendarIDs) &&
        calendarIDs.length > 0
      ) {
        newEvent.calendar_id = calendarIDs[0];
        event_created(
          newEvent as TimespanEvent,
          saveEvent,
          cancelEvent,
          updateEvent,
        );
      } else {
        isCreatingNewEvent = false;
      }
    } else {
      isCreatingNewEvent = false;
    }
    newEvent = null;
    negativeDragStartPosition = null;
    dragState = { held: false, x: 0, y: 0 };
  }

  function updateEvent(event: TimespanEvent) {
    if (typeof event.when.start_time === "object") {
      event.when.start_time = Math.floor(
        (<Date>event.when.start_time).getTime() / 1000,
      );
    } else {
      event.when.start_time = Math.floor(event.when.start_time / 1000);
    }

    if (typeof event.when.end_time === "object") {
      event.when.end_time = Math.floor(
        (<Date>event.when.end_time).getTime() / 1000,
      );
    } else {
      event.when.end_time = Math.floor(event.when.end_time / 1000);
    }

    let minutesInVisibleDay =
      new Date(event.when.start_time * 1000).getTime() -
      new Date(
        new Date(event.when.start_time * 1000).setHours(0, startMinute, 0, 0),
      ).getTime();
    minutesInVisibleDay = minutesInVisibleDay / 60000; // in minutes

    let runTime =
      new Date(event.when.end_time * 1000).getTime() -
      new Date(event.when.start_time * 1000).getTime();
    runTime = runTime / 60000; // in minutes

    event.relativeStartTime = minutesInVisibleDay / timeSpan;
    event.relativeRunTime = runTime / timeSpan;

    eventSource[eventSource.length - 1] = event;
    eventSource = [...eventSource];
  }

  function saveEvent(event: TimespanEvent) {
    if (typeof event !== "object") {
      console.warn("Invalid event object provided.");
      return;
    }
    if (typeof event.when.start_time === "object") {
      event.when.start_time = Math.floor(
        (<Date>event.when.start_time).getTime() / 1000,
      );
    } else {
      event.when.start_time = Math.floor(event.when.start_time / 1000);
    }

    if (typeof event.when.end_time === "object") {
      event.when.end_time = Math.floor(
        (<Date>event.when.end_time).getTime() / 1000,
      );
    } else {
      event.when.end_time = Math.floor(event.when.end_time / 1000);
    }

    EventStore.createEvent(event, query);
    eventSource[eventSource.length - 1].isNewEvent = false;
    isCreatingNewEvent = false;
  }

  function cancelEvent() {
    eventSource.pop();
    eventSource = [...eventSource];
    isCreatingNewEvent = false;
  }

  // #endregion event handlers
</script>

<style lang="scss">
  @use 'sass:list';
  @import "../../theming/reset.scss";
  @import "../../theming/variables.scss";

  main {
    --mainTextAndDeclinedEvents: #000000;
    --calendarEventText: #ffffff;
    --linesAndIcons: #d5d5d5;
    --monthsOnMobileDropdown: #f1f1f1;
    --primaryAndMainCalendar: #002db4;
    --secondaryCalendar: #315df2;
    --thirdCalendar: #078351;
    --timeLine: #36d2ac;
    --declinedEvent: #636671;
    --alertWarningDeclined: #36d2ac;
    --headerBackground: #ffffff;
    --emptyEventBackground: #eeeeee;
    @import "./styles/agenda-themes.scss";

    text-align: center;
    height: 100%;
    margin: 0 auto;
    font-family: Arial, Helvetica, sans-serif;
    display: grid;
    grid-template-rows: 80px auto 1fr;
    grid-template-columns: 1fr;
    grid-column-gap: 5px;
    overflow: hidden;
    line-height: 100%;
    transition: 0.2s;
    &.headless {
      grid-template-rows: 1fr;
    }
  }

  @import "./themes/theme-1";
  @import "./themes/theme-2";
  @import "./themes/theme-3";
  @import "./themes/theme-4";
  @import "./themes/theme-5";

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    grid-column: 1/3;
    color: var(--mainTextAndDeclinedEvents);
    background: var(--headerBackground);
    z-index: 1;
    padding-left: 10px;

    button {
      padding: 0rem 0.5rem;
      background: transparent;

      &:first-of-type {
        padding-left: 0;
      }

      svg path {
        fill: var(--linesAndIcons);
        transition: 0.2s;
      }
    }

    .month,
    .day {
      display: flex;
      flex-direction: row;
      gap: 15px;
      align-items: center;
    }

    .month {
      h1 {
        font-size: 26px;
        font-weight: bold;
        margin: 0;
        span {
          font-weight: lighter;
        }
      }
    }

    .day {
      white-space: nowrap;
      display: grid;

      &.allow_date_change {
        grid-template-columns: 1fr auto 1fr;
        width: 100%;
      }
      button {
        cursor: pointer;
        &.prev {
          text-align: right;
        }
        &.next {
          text-align: left;
        }

        &:hover,
        &:focus {
          svg path {
            fill: hsl(var(--linesAndIcons), 50%);
          }
        }
      }
      h2 {
        font-size: 20px;
        margin: 0;
        font-weight: lighter;
        span {
          background-color: var(--primaryAndMainCalendar);
          color: var(--calendarEventText);
          border-radius: 20px;
          display: inline-block;
          font-weight: bold;
          padding: 4px;
          display: inline-block;
          width: 22px;
          height: 22px;
          font-weight: 300;
          font-size: 14px;
          text-align: center;
          line-height: 22px;
        }
      }
    }
  }

  h2 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    margin-bottom: 0px;
    font-weight: 600;
  }

  .all-day {
    display: grid;
    grid-column: 1/3;
    margin-bottom: 1rem;
    max-height: 20vh;
    overflow-y: scroll;

    .events {
      gap: 0;
      .event {
        height: 40px;
        position: relative;
        width: calc(100% - 4px);
      }
    }
  }

  .timespan {
    display: grid;
    grid-column: 1/3;
    grid-template-columns: 40px 1fr;
    overflow: hidden;
    line-height: 100%;

    &.hide-ticks {
      grid-template-columns: 0px 1fr;
      grid-column-gap: 0;

      .ticks {
        visibility: hidden;
      }
    }
  }

  .events {
    display: grid;
    gap: 1rem;
    position: relative;
    min-width: 100px;
    border-left: 1px solid var(--linesAndIcons);
    border-right: 1px solid var(--linesAndIcons);

    &.overflowing {
      overflow-y: auto;
    }

    &.scrolling .event,
    &.scrolling .tick {
      transition: 0s;
    }

    .no-events {
      background: #eee;
      padding: 1rem;
    }

    .event {
      position: absolute;
      overflow: hidden;
      opacity: 1;
      background: var(--primaryAndMainCalendar);
      border-radius: 4px;
      box-sizing: border-box;
      color: var(--calendarEventText);
      cursor: pointer;
      text-align: left;
      font-size: 0.9rem;
      letter-spacing: 0.01rem;
      transition: 0.5s;
      margin: 2px;
      -webkit-font-smoothing: antialiased;

      &.expanded {
        top: 0 !important;
        left: 0 !important;
        width: calc(100% - 4px) !important; // factors in margin spacing
        height: calc(100% - 4px) !important;
        overflow-y: auto;
        z-index: 1;
      }

      &.new-event {
        transition: none;
        animation-delay: 0s !important;
        animation-duration: 0s !important;
      }

      &.status-maybe {
        background-color: var(--emptyEventBackground) !important;
        border-left-width: 7px;
        color: var(--secondaryCalendar) !important;

        // diagonal stripes
        background-image: linear-gradient(
          45deg,
          transparent,
          transparent 40%,
          rgba(0, 0, 0, 0.2) 40%,
          rgba(0, 0, 0, 0.2) 50%,
          transparent 50%,
          transparent 90%,
          rgba(0, 0, 0, 0.2) 90%,
          rgba(0, 0, 0, 0.2)
        );
        background-size: 12px 12px;
      }

      &.status-noreply {
        background-color: var(--emptyEventBackground) !important;
        color: var(--secondaryCalendar) !important;
        a {
          color: var(--secondaryCalendar) !important;
        }
      }

      &.status-no {
        > .inner > h2 {
          text-decoration: line-through;
        }

        border-color: var(--alertWarningDeclined);
        color: var(--alertWarningDeclined);
        background-color: var(--emptyEventBackground) !important;

        a {
          color: var(--secondaryCalendar) !important;
        }
      }

      @for $i from 1 through 50 {
        &:nth-child(#{$i}) {
          animation-name: eventsIn;
          animation-duration: 0.5s;
          animation-delay: 0.1s + (0.05 * $i);
          animation-fill-mode: both;
        }
      }

      a {
        color: white;
        text-decoration: underline;
      }

      .inner {
        padding: 5px 5px 8px;
        &.tiny-event {
          padding-top: 0;
          h2,
          span {
            font-size: 70%;
          }
        }
        span.time,
        p {
          font-size: 12px;
        }
      }
    }

    .hour-ticks {
      height: 100%;
      width: 100%;
      position: relative;
      span {
        position: absolute;
        height: 1px;
        width: 100%;
        border-top: 1px solid var(--linesAndIcons);
        left: 0;
      }
    }
  }

  .ticks {
    pointer-events: none;
    height: 100%;
    color: var(--mainTextAndDeclinedEvents);
    font-size: 12px;
    position: relative;
    overflow: hidden;
    .tick {
      position: absolute;
      width: 100%;
      text-align: right;
      display: block;
      white-space: nowrap;
      font-size: 11px;
      opacity: 0.5;
    }
  }

  .now {
    position: absolute;
    height: 4px;
    width: 100%;
    background-color: var(--timeLine);

    svg {
      position: absolute;
      left: -39px;
      top: -6px;
      height: 16px;
      width: 39px;

      path {
        fill: var(--timeLine);
      }
    }
  }

  .condensed {
    .events {
      grid-auto-rows: min-content;
      grid-column: 1/3;
      gap: 5px;
      .event {
        transition: 0.5s;
        .inner {
          display: grid;
          grid-template-columns: min-content 1fr;
          gap: 1rem;
          & > h2 {
            grid-column: 2;
            grid-row: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          & > span.time {
            grid-column: 1;
            grid-row: 1;
            white-space: nowrap;
          }
          & > p,
          & > .location {
            grid-column: 1 / -1;
          }
        }
        h2 {
          float: left;
        }
        span {
          float: left;
        }
        p {
          clear: both;
        }
      }
    }
    .ticks,
    .now {
      display: none;
    }
  }

  @media #{$desktop} {
    main {
      max-width: none;
    }
  }

  @keyframes eventsIn {
    0% {
      transform: translate(0, 30px);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translate(0, 0);
    }
  }
</style>

<nylas-error {id} />

{#if themeUrl}
  <link rel="stylesheet" href={themeUrl} />
{/if}

<main
  class:headless={header_type === "none"}
  data-cy="nylas-agenda"
  class={!!themeUrl ? "custom" : internalProps.theme}
>
  {#await hydratedEvents}
    (loading events)
  {:then events}
    {#if header_type !== "none"}
      <header
        on:pointerdown={headerMouseDown}
        on:pointermove={headerMouseMove}
        on:pointerup={headerMouseUp}
        on:mouseleave={headerMouseUp}
      >
        {#if header_type === "full"}
          <div class="month">
            <h1>
              {selectedDate.toLocaleString("default", { month: "long" })}
              <span class="year"
                >{selectedDate.toLocaleString("default", {
                  year: "numeric",
                })}</span
              >
            </h1>
          </div>
        {/if}
        <div class="day" class:allow_date_change>
          {#if allow_date_change}
            <button
              disabled={dateIsFirstAllowed}
              on:click={goToPreviousDate}
              class="prev change-date"
            >
              <svg
                width="14"
                height="23"
                viewBox="0 0 14 23"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.371272 12.413L10.6278 22.4264C11.1225 22.9093 11.9245 22.9093 12.4191 22.4264L13.6153 21.2585C14.1092 20.7764 14.1101 19.995 13.6175 19.5117L5.48895 11.5385L13.6175 3.56541C14.1101 3.08216 14.1092 2.30079 13.6153 1.81868L12.4191 0.650778C11.9244 0.167839 11.1224 0.167839 10.6278 0.650778L0.371272 10.6641C-0.123338 11.1471 -0.123338 11.93 0.371272 12.413Z"
                />
              </svg>
            </button>
          {/if}
          <h2>
            {selectedDate.toLocaleString("default", {
              weekday: condensed ? "short" : "long",
            })}
            <span class="date"
              >{selectedDate.toLocaleString("default", {
                day: "numeric",
              })}
            </span>
          </h2>
          {#if allow_date_change}
            <button
              disabled={dateIsLastAllowed}
              on:click={goToNextDate}
              class="next change-date"
            >
              <svg
                width="14"
                height="23"
                viewBox="0 0 14 23"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.6153 10.6642L3.35873 0.650778C2.86407 0.16784 2.0621 0.16784 1.56749 0.650778L0.371229 1.81868C-0.12259 2.30079 -0.123539 3.08216 0.369118 3.56541L8.49763 11.5386L0.369118 19.5117C-0.123539 19.995 -0.12259 20.7764 0.371229 21.2585L1.56749 22.4264C2.06215 22.9093 2.86412 22.9093 3.35873 22.4264L13.6153 12.413C14.1099 11.9301 14.1099 11.1471 13.6153 10.6642Z"
                />
              </svg>
            </button>
          {/if}
        </div>
      </header>
    {/if}

    <div class="all-day">
      {#if !hide_all_day_events}
        <ul class="events {theme}">
          {#if Array.isArray(allDayEvents)}
            {#each allDayEvents as event}
              <li
                tabindex="0"
                class="event status-{event.attendeeStatus}"
                data-calendar-id={calendarIDs.indexOf(event.calendar_id) + 1}
                on:click={(ev) => eventClicked(ev, event)}
                on:keyup={(ev) => {
                  if (ev.key === "Enter") {
                    eventClicked(ev, event);
                  }
                }}
              >
                <div class="inner">
                  {#if !show_as_busy}
                    <h2>{event.title}</h2>
                  {:else}
                    <h2>Busy</h2>
                  {/if}
                  {#if !show_as_busy}
                    {#if event.location}
                      <span class="location">
                        {#if event.locationString}
                          <a href={event.location} target="_blank">
                            {event.locationString}
                          </a>
                        {:else}{event.location}{/if}
                      </span>
                    {/if}
                    <p>
                      {@html event.description || ""}
                    </p>
                  {/if}
                </div>
              </li>
            {/each}
          {/if}
        </ul>
      {/if}
    </div>

    <div
      class="timespan"
      class:condensed
      class:hide-ticks={hide_ticks}
      on:selectstart={(event) => {
        if (allow_event_creation) event.preventDefault();
      }}
    >
      <div class="ticks">
        {#each ticks as tick}
          <span style="top: {tick.relativeTickPosition * 100}%" class="tick">
            {tick.formatted}
          </span>
        {/each}
      </div>
      <ul
        class="events {theme}"
        class:diff-by-calendar={color_by === "calendar"}
        class:diff-by-event={color_by === "event"}
        class:overflowing
        class:scrolling
        style="transform:
      translate({$dampener.x}px,0px)"
        bind:this={agendaElement}
        bind:clientHeight
        on:wheel={prevent_zoom || condensed ? () => {} : handleWheel}
        on:pointerdown={agendaMouseDown}
        on:pointermove={agendaMouseMove}
        on:pointerup={agendaMouseUp}
        on:mouseleave={agendaMouseUp}
      >
        <div class="hour-ticks">
          {#each ticks as tick}
            <span style="top: {tick.relativeTickPosition * 100}%" />
          {/each}
        </div>
        {#if Array.isArray(events)}
          {#each [...events, newEvent] as event}
            {#if event && event.relativeStartTime !== undefined}
              <li
                tabindex="0"
                class:new-event={event.isNewEvent}
                on:click={(ev) => eventClicked(ev, event)}
                on:keyup={(ev) => {
                  if (ev.key === "Enter") {
                    eventClicked(ev, event);
                  }
                }}
                class:expanded={expandedEventId === event.id}
                class="event status-{event.attendeeStatus}"
                data-calendar-id={calendarIDs.indexOf(event.calendar_id) + 1}
                style="top: {event.relativeStartTime *
                  100}%; height: 
              {condensed
                  ? `calc(${event.relativeRunTime * 100}% - 4px)`
                  : `calc(${
                      event.relativeRunTime * 100
                    }%  - 4px)`};
              left: {event.relativeOverlapOffset *
                  100}%; 
              width: calc({event.relativeOverlapWidth *
                  100}% - 4px)"
              >
                <div
                  class="inner"
                  class:tiny-event={event.relativeRunTime <= 0.03}
                >
                  {#if !show_as_busy}
                    <h2>{event.title}</h2>
                  {:else}
                    <h2>Busy</h2>
                  {/if}
                  {#if event.when && "start_time" in event.when}
                    <span class="time">
                      {new Date(
                        event.when.start_time * 1000,
                      ).toLocaleTimeString(navigator.language, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  {/if}
                  {#if !show_as_busy}
                    {#if event.location}
                      <span class="location">
                        {#if event.locationString}
                          <a href={event.location} target="_blank">
                            {event.locationString}
                          </a>
                        {:else}{event.location}{/if}
                      </span>
                    {/if}
                    <p>
                      {@html event.description || ""}
                    </p>
                  {/if}
                </div>
              </li>
            {/if}
          {/each}
          {#if !hideCurrentTime}
            <span class="now" style="top: {currentTimePosition()}%;">
              <svg
                width="39"
                height="16"
                viewBox="0 0 39 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16H24C27.7277 16 30.8599 13.4505 31.748 10H39V6H31.748C30.8599 2.54955 27.7277 0 24 0H8ZM4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8C28 10.2091 26.2091 12 24 12H8C5.79086 12 4 10.2091 4 8Z"
                />
              </svg>
            </span>
          {/if}
        {:else if show_no_events_message && $EventStore[queryKey]}
          <li class="no-events">No events for {selectedDate.toDateString()}</li>
        {/if}
      </ul>
    </div>
  {/await}
</main>
