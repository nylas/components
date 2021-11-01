<svelte:options tag="nylas-schedule-editor" />

<script lang="ts">
  import { ManifestStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";

  import type { Manifest } from "@commons/types/ScheduleEditor";
  import parseStringToArray, {
    buildInternalProps,
  } from "@commons/methods/component";
  import { weekdays } from "@commons/methods/datetime";
  import { NotificationMode } from "@commons/enums/Scheduler";
  // TODO: switch for local development
  // import "@nylas/components-availability";
  // import "../../availability";
  import "../../availability/src/Availability.svelte";
  // import "@nylas/components-scheduler";
  // import "../../scheduler";
  import "../../scheduler/src/Scheduler.svelte";
  import type { AvailabilityRule, TimeSlot } from "@commons/types/Availability";

  export let id: string = "";
  export let access_token: string = "";

  export let allow_booking: boolean;
  export let attendees_to_show: number;
  export let capacity: number | null;
  export let dates_to_show: number;
  export let email_ids: string[];
  export let end_hour: number;
  export let event_conferencing: string;
  export let event_description: string;
  export let event_location: string;
  export let event_title: string;
  export let mandate_top_of_hour: boolean;
  export let max_bookable_slots: number;
  export let max_book_ahead_days: number;
  export let min_book_ahead_days: number;
  export let notification_message: string;
  export let notification_mode: NotificationMode;
  export let notification_subject: string;
  export let open_hours: AvailabilityRule[];
  export let partial_bookable_ratio: number;
  export let recurrence: "none" | "required" | "optional";
  export let recurrence_cadence: (
    | "none"
    | "daily"
    | "weekdays"
    | "weekly"
    | "biweekly"
    | "monthly"
  )[];
  export let show_as_week: boolean;
  export let show_hosts: "show" | "hide";
  export let show_preview: boolean;
  export let show_ticks: boolean;
  export let show_weekends: boolean;
  export let slot_size: number; // in minutes
  export let start_date: Date;
  export let start_hour: number;
  export let view_as: "schedule" | "list";

  const defaultValueMap = {
    allow_booking: false,
    attendees_to_show: 5,
    capacity: 1,
    dates_to_show: 1,
    email_ids: [],
    end_hour: 17,
    event_conferencing: "",
    event_description: "",
    event_location: "",
    event_title: "Meeting",
    mandate_top_of_hour: false,
    max_bookable_slots: 1,
    max_book_ahead_days: 30,
    min_book_ahead_days: 0,
    notification_message: "Thank you for scheduling!",
    notification_mode: NotificationMode.SHOW_MESSAGE,
    notification_subject: "Invitation",
    open_hours: [],
    partial_bookable_ratio: 0.01,
    recurrence_cadence: ["none"],
    recurrence: "none",
    show_as_week: false,
    show_hosts: "show",
    show_ticks: true,
    show_weekends: true,
    slot_size: 15,
    start_date: new Date(),
    start_hour: 9,
    view_as: "schedule",
  };

  //#region mount and prop initialization
  let internalProps: Manifest = <any>{};
  let manifest: Partial<Manifest> = {};
  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};

    if (manifest) {
      setManifestDefaults(manifest);
    }

    updateInternalProps(
      buildInternalProps($$props, manifest, defaultValueMap) as Manifest,
    );
  });

  $: {
    const rebuiltProps = buildInternalProps(
      $$props,
      manifest,
      defaultValueMap,
    ) as Manifest;
    if (JSON.stringify(rebuiltProps) !== JSON.stringify(internalProps)) {
      updateInternalProps(rebuiltProps);
    }
  }

  function updateInternalProps(updatedProps: Manifest) {
    internalProps = updatedProps;

    allow_booking = internalProps.allow_booking;
    attendees_to_show = internalProps.attendees_to_show;
    capacity = internalProps.capacity;
    dates_to_show = internalProps.dates_to_show;
    email_ids = internalProps.email_ids;
    end_hour = internalProps.end_hour;
    event_conferencing = internalProps.event_conferencing;
    event_description = internalProps.event_description;
    event_location = internalProps.event_location;
    event_title = internalProps.event_title;
    mandate_top_of_hour = internalProps.mandate_top_of_hour;
    max_bookable_slots = internalProps.max_bookable_slots;
    max_book_ahead_days = internalProps.max_book_ahead_days;
    min_book_ahead_days = internalProps.min_book_ahead_days;
    notification_message = internalProps.notification_message;
    notification_mode = internalProps.notification_mode;
    notification_subject = internalProps.notification_subject;
    open_hours = internalProps.open_hours;
    partial_bookable_ratio = internalProps.partial_bookable_ratio;
    recurrence = internalProps.recurrence;
    recurrence_cadence = internalProps.recurrence_cadence;
    show_as_week = internalProps.show_as_week;
    show_hosts = internalProps.show_hosts;
    show_preview = internalProps.show_preview;
    show_ticks = internalProps.show_ticks;
    show_weekends = internalProps.show_weekends;
    slot_size = internalProps.slot_size;
    start_date = internalProps.start_date;
    start_hour = internalProps.start_hour;
    view_as = internalProps.view_as;
  }

  // Manifest properties requiring further manipulation:

  function setManifestDefaults(manifest: Partial<Manifest>) {
    if (email_ids.length) {
      emailIDs = email_ids?.join(", ");
    } else if (manifest.email_ids) {
      emailIDs = manifest.email_ids?.join(", ");
    }
    if (start_date) {
      startDate = start_date.toLocaleDateString("en-CA");
    } else if (manifest.start_date) {
      startDate = manifest.start_date.toLocaleDateString("en-CA");
    }
    if (recurrence_cadence) {
      recurrenceCadence = recurrence_cadence;
    } else if (manifest.recurrence_cadence) {
      recurrenceCadence = manifest.recurrence_cadence;
    }
  }
  let emailIDs: string = "";
  let startDate: string = new Date().toLocaleDateString("en-CA");
  let recurrenceCadence: string[] = [];

  $: {
    internalProps.recurrence_cadence = <any>recurrenceCadence;
  }

  $: {
    internalProps.email_ids = parseStringToArray(emailIDs);
  }

  $: {
    internalProps.start_date = new Date(
      new Date(startDate).getTime() -
        new Date(startDate).getTimezoneOffset() * -60000,
    );
  }

  $: {
    internalProps.open_hours = open_hours;
  }
  // #endregion mount and prop initialization

  function saveProperties() {
    console.log("Saving the following properties:");
    Object.entries(internalProps).forEach(([k, v]) => {
      console.log(k, v);
    });
  }

  // #region unpersisted variables
  let customize_weekdays: boolean = false;
  let allow_weekends: boolean = false;

  function availabilityChosen(event: any) {
    open_hours = event.detail.timeSlots.map((slot: TimeSlot) => {
      let { start_time, end_time } = slot;
      let openTime = {
        startHour: start_time.getHours(),
        startMinute: start_time.getMinutes(),
        endHour: end_time.getHours(),
        endMinute: end_time.getMinutes(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      if (customize_weekdays || allow_weekends) {
        openTime.startWeekday = start_time.getDay();
        openTime.endWeekday = end_time.getDay();
      }
      return openTime;
    });
  }

  // niceDate: shows date rules in a nice string format; selectively includes weekday if customize_weekdays / allow_weekends are set
  function niceDate(block: AvailabilityRule) {
    let startMoment = new Date(
      0,
      0,
      0,
      block.startHour,
      block.startMinute,
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let endMoment = new Date(
      0,
      0,
      0,
      block.endHour,
      block.endMinute,
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if ((customize_weekdays || allow_weekends) && block.startWeekday) {
      let weekday = weekdays[block.startWeekday];
      return `${weekday}: ${startMoment} - ${endMoment}`;
    } else {
      return `${startMoment} - ${endMoment}`;
    }
  }
  // #endregion unpersisted variables

  let width = "60%";
  let gutterWidth = 35;
  $: width = showPreview ? "60%" : "100%";
  let adjustingPreviewPane: boolean = false;

  function adjustColumns(e: MouseEvent) {
    if (adjustingPreviewPane) {
      width = `${e.clientX - gutterWidth}px`;
    }
  }

  let debouncedInputTimer: number;
  function debounceEmailInput(e: HTMLInputElement) {
    const emailString = e.target.value;
    clearTimeout(debouncedInputTimer);
    debouncedInputTimer = setTimeout(() => {
      emailIDs = emailString;
    }, 1000);
  }

  let slots_to_book: TimeSlot;
  let mainElementWidth: number;
  $: showPreview = mainElementWidth > 600;
</script>

<style lang="scss">
  @import "./styles/schedule-editor.scss";
</style>

{#if manifest && manifest.error}
  <nylas-domain-error {id} />
{:else}
  <main
    style="grid-template-columns: {width} 5px auto"
    on:mousemove={adjustColumns}
    on:mouseup={() => (adjustingPreviewPane = false)}
    bind:clientWidth={mainElementWidth}
  >
    <div class="settings">
      <section class="basic-details">
        <h1>Event Details</h1>
        <div class="contents">
          <label>
            <strong>Event Title</strong>
            <input type="text" bind:value={internalProps.event_title} />
          </label>
          <label>
            <strong>Event Description</strong>
            <input type="text" bind:value={internalProps.event_description} />
          </label>
          <label>
            <strong>Event Location</strong>
            <input type="text" bind:value={internalProps.event_location} />
          </label>
          <label>
            <strong>Event Conferencing</strong>
            <input type="url" bind:value={internalProps.event_conferencing} />
          </label>
          <div role="radiogroup" aria-labelledby="show_hosts">
            <strong id="show_hosts">Show meeting hosts to the end-user?</strong>
            <label>
              <input
                type="radio"
                name="show_hosts"
                value={"show"}
                bind:group={internalProps.show_hosts}
              />
              <span>Show Hosts</span>
            </label>
            <label>
              <input
                type="radio"
                name="show_hosts"
                value={"hide"}
                bind:group={internalProps.show_hosts}
              />
              <span>Hide Hosts</span>
            </label>
          </div>
          <div>
            <div>
              <strong id="email_ids">Email Ids to include for scheduling</strong
              >
            </div>
            <label>
              <textarea
                name="email_ids"
                on:input={debounceEmailInput}
                value={emailIDs}
              />
            </label>
          </div>
        </div>
        <button on:click={saveProperties}>Save Editor Options</button>
      </section>
      <section class="time-date-details">
        <h1>Date/Time Details</h1>
        <div class="contents">
          <div>
            <label>
              <strong>Start Hour</strong>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                bind:value={internalProps.start_hour}
              />
            </label>
            {internalProps.start_hour}:00
          </div>
          <div>
            <label>
              <strong>End Hour</strong>
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                bind:value={internalProps.end_hour}
              />
            </label>
            {internalProps.end_hour}:00
          </div>
          <div role="radiogroup" aria-labelledby="slot_size">
            <strong id="slot_size">Timeslot size</strong>
            <label>
              <input
                type="radio"
                name="slot_size"
                value={15}
                bind:group={internalProps.slot_size}
              />
              <span>15 minutes</span>
            </label>
            <label>
              <input
                type="radio"
                name="slot_size"
                value={30}
                bind:group={internalProps.slot_size}
              />
              <span>30 minutes</span>
            </label>
            <label>
              <input
                type="radio"
                name="slot_size"
                value={60}
                bind:group={internalProps.slot_size}
              />
              <span>60 minutes</span>
            </label>
          </div>
          <label>
            <strong>Start Date</strong>
            <input type="date" bind:value={startDate} />
          </label>
          <div>
            <label>
              <strong>Days to show</strong>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                bind:value={internalProps.dates_to_show}
              />
            </label>
            {internalProps.dates_to_show}
          </div>
          <div role="checkbox" aria-labelledby="show_as_week">
            <strong id="show_as_week">Show as week</strong>
            <label>
              <input
                type="checkbox"
                name="show_as_week"
                bind:checked={internalProps.show_as_week}
              />
              Show whole week
            </label>
          </div>
          <div role="checkbox" aria-labelledby="show_weekends">
            <strong id="show_weekends">Show weekends</strong>
            <label>
              <input
                type="checkbox"
                name="show_weekends"
                bind:checked={internalProps.show_weekends}
              />
              Keep weekends on
            </label>
          </div>
          <div class="available-hours">
            <strong>Available Hours</strong>
            <p>
              Drag over the hours want to be availble for booking. All other
              hours will always show up as "busy" to your users.
            </p>
            <div role="checkbox" aria-labelledby="show_as_week">
              <label>
                <input
                  type="checkbox"
                  name="customize_weekdays"
                  bind:checked={customize_weekdays}
                />
                Customize each weekday
              </label>
            </div>
            <div role="checkbox" aria-labelledby="show_as_week">
              <label>
                <input
                  type="checkbox"
                  name="allow_weekends"
                  bind:checked={allow_weekends}
                />
                Allow booking on weekends
              </label>
            </div>
            <div class="availability-container">
              <nylas-availability
                allow_booking={true}
                max_bookable_slots={Infinity}
                show_as_week={customize_weekdays || allow_weekends}
                show_weekends={allow_weekends}
                start_hour={internalProps.start_hour}
                end_hour={internalProps.end_hour}
                allow_date_change={false}
                partial_bookable_ratio="0"
                show_header={false}
                date_format={customize_weekdays || allow_weekends
                  ? "weekday"
                  : "none"}
                busy_color="#000"
                closed_color="#999"
                selected_color="#095"
                slot_size="15"
                on:timeSlotChosen={availabilityChosen}
              />
            </div>
            <ul class="availability">
              {#each open_hours as availability}
                <li>
                  <span class="date">
                    {niceDate(availability)}
                  </span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <button on:click={saveProperties}>Save Editor Options</button>
      </section>
      <section class="style-details">
        <h1>Style Details</h1>
        <div class="contents">
          <div role="checkbox" aria-labelledby="show_ticks">
            <strong id="show_ticks">Show ticks</strong>
            <label>
              <input
                type="checkbox"
                name="show_ticks"
                bind:checked={internalProps.show_ticks}
              />
              Show tick marks on left side
            </label>
          </div>
          <div role="radiogroup" aria-labelledby="view_as">
            <strong id="view_as">View as a Schedule, or as a List?</strong>
            <label>
              <input
                type="radio"
                name="view_as"
                bind:group={internalProps.view_as}
                value="schedule"
              />
              <span>Schedule</span>
            </label>
            <label>
              <input
                type="radio"
                name="view_as"
                bind:group={internalProps.view_as}
                value="list"
              />
              <span>List</span>
            </label>
          </div>
          <label>
            <strong>Attendees to show</strong>
            <input
              type="number"
              min={1}
              max={20}
              bind:value={internalProps.attendees_to_show}
            />
          </label>
        </div>
        <button on:click={saveProperties}>Save Editor Options</button>
      </section>
      <section class="booking-details">
        <h1>Booking Details</h1>
        <div class="contents">
          <div role="checkbox" aria-labelledby="allow_booking">
            <strong id="allow_booking">Allow booking</strong>
            <label>
              <input
                type="checkbox"
                name="allow_booking"
                bind:checked={internalProps.allow_booking}
              />
              Allow bookings to be made
            </label>
          </div>
          <label>
            <strong>Maximum slots that can be booked at once</strong>
            <input
              type="number"
              min={1}
              max={20}
              bind:value={internalProps.max_bookable_slots}
            />
          </label>
          <label>
            <strong>Participant Threshold / Partial bookable ratio</strong>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              bind:value={internalProps.partial_bookable_ratio}
            />
            {Math.floor(internalProps.partial_bookable_ratio * 100)}%
          </label>
          <div role="radiogroup" aria-labelledby="recurrence">
            <strong id="recurrence"
              >Allow, Disallow, or Mandate events to repeat?</strong
            >
            <label>
              <input
                type="radio"
                name="recurrence"
                bind:group={internalProps.recurrence}
                value="none"
              />
              <span>Don't Repeat Events</span>
            </label>
            <label>
              <input
                type="radio"
                name="recurrence"
                bind:group={internalProps.recurrence}
                value="optional"
              />
              <span>Users May Repeat Events</span>
            </label>
            <label>
              <input
                type="radio"
                name="recurrence"
                bind:group={internalProps.recurrence}
                value="required"
              />
              <span>Events Always Repeat</span>
            </label>
          </div>
          <label>
            <strong>Capacity</strong>
            <input type="number" min={1} bind:value={internalProps.capacity} />
          </label>
          <div role="checkbox" aria-labelledby="allow_booking">
            <strong>Top of the Hour Events</strong>
            <label>
              <input
                type="checkbox"
                name="mandate_top_of_hour"
                bind:checked={internalProps.mandate_top_of_hour}
              />
              Only allow events to be booked at the Top of the Hour
            </label>
          </div>
          {#if internalProps.recurrence === "required" || internalProps.recurrence === "optional"}
            <div role="radiogroup" aria-labelledby="recurrence_cadence">
              <strong id="recurrence_cadence"
                >How often should events repeat{#if internalProps.recurrence === "optional"},
                  if a user chooses to do so{/if}?</strong
              >
              <label>
                <input
                  type="checkbox"
                  name="recurrence_cadence"
                  bind:group={recurrenceCadence}
                  value="daily"
                />
                <span>Daily</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="recurrence_cadence"
                  bind:group={recurrenceCadence}
                  value="weekdays"
                />
                <span>Daily, only on weekdays</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="recurrence_cadence"
                  bind:group={recurrenceCadence}
                  value="weekly"
                />
                <span>Weekly</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="recurrence_cadence"
                  bind:group={recurrenceCadence}
                  value="biweekly"
                />
                <span>Biweekly</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="recurrence_cadence"
                  bind:group={recurrenceCadence}
                  value="monthly"
                />
                <span>Monthly</span>
              </label>
            </div>
          {/if}
        </div>
        <button on:click={saveProperties}>Save Editor Options</button>
      </section>
      <section class="Notification-details">
        <h1>Notification Details</h1>
        <div class="contents">
          <div role="radiogroup" aria-labelledby="notification_mode">
            <strong id="notification_mode"
              >How would you like to notify the customer on event creation?</strong
            >
            <label>
              <input
                type="radio"
                name="notification_mode"
                value={NotificationMode.SHOW_MESSAGE}
                bind:group={internalProps.notification_mode}
              />
              <span>Show Message on UI</span>
            </label>
            <label>
              <input
                type="radio"
                name="notification_mode"
                value={NotificationMode.SEND_MESSAGE}
                bind:group={internalProps.notification_mode}
              />
              <span>Send message via email</span>
            </label>
          </div>
          <label>
            <strong>Notification message</strong>
            <input
              type="text"
              bind:value={internalProps.notification_message}
            />
          </label>
          <label>
            <strong>Notification Subject</strong>
            <input
              type="text"
              bind:value={internalProps.notification_subject}
            />
          </label>
        </div>
        <button on:click={saveProperties}>Save Editor Options</button>
      </section>
    </div>
    {#if showPreview}
      <span class="gutter" on:mousedown={() => (adjustingPreviewPane = true)} />
      <aside id="preview">
        <h1>Preview</h1>
        <nylas-availability
          {...internalProps}
          capacity={null}
          on:timeSlotChosen={(event) => {
            slots_to_book = event.detail.timeSlots;
          }}
          calendars={!internalProps.email_ids
            ? [
                {
                  availability: "busy",
                  timeslots: [],
                },
              ]
            : []}
          {id}
        />
        <nylas-scheduler
          {slots_to_book}
          {...internalProps}
          capacity={null}
          calendars={!internalProps.email_ids
            ? [
                {
                  availability: "busy",
                  timeslots: [],
                },
              ]
            : []}
          {id}
        />
      </aside>
    {/if}
  </main>
{/if}
