<svelte:options tag="nylas-schedule-editor" />

<script lang="ts">
  import { ManifestStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";

  import type { Manifest } from "@commons/types/ScheduleEditor";
  import parseStringToArray, {
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";
  import { NotificationMode } from "@commons/enums/Scheduler";

  export let id: string = "";
  export let access_token: string = "";
  export let event_title: string;
  export let event_description: string;
  export let event_location: string;
  export let event_conferencing: string;
  export let show_hosts: "show" | "hide";
  export let start_hour: number;
  export let end_hour: number;
  export let slot_size: number; // in minutes
  export let start_date: Date;
  export let dates_to_show: number;
  export let show_ticks: boolean;
  export let email_ids: string[];
  export let allow_booking: boolean;
  export let max_bookable_slots: number;
  export let partial_bookable_ratio: number;
  export let show_as_week: boolean;
  export let show_weekends: boolean;
  export let attendees_to_show: number;
  export let notification_mode: NotificationMode;
  export let notification_message: string;
  export let notification_subject: string;
  export let view_as: "schedule" | "list";
  export let recurrence: "none" | "mandated" | "optional";
  export let recurrence_cadence: string[]; // "none" | "daily" | "weekly" | "biweekly" | "monthly";
  export let capacity: number;

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};

    internalProps = buildInternalProps($$props, manifest) as Partial<Manifest>;
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
    event_title = getPropertyValue(
      internalProps.event_title,
      event_title,
      "Meeting",
    );
    event_description = getPropertyValue(
      internalProps.event_description,
      event_description,
      "",
    );
    event_conferencing = getPropertyValue(
      internalProps.event_conferencing,
      event_conferencing,
      "",
    );
    event_location = getPropertyValue(
      internalProps.event_location,
      event_location,
      "",
    );
    view_as = getPropertyValue(internalProps.view_as, view_as, "schedule");
    show_hosts = getPropertyValue(internalProps.show_hosts, show_hosts, "show");
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
    notification_mode = getPropertyValue(
      internalProps.notification_mode,
      notification_mode,
      NotificationMode.SHOW_MESSAGE,
    );
    notification_message = getPropertyValue(
      internalProps.notification_message,
      notification_message,
      "Thank you for scheduling!",
    );
    notification_subject = getPropertyValue(
      internalProps.notification_subject,
      notification_subject,
      "Invitation",
    );
    recurrence = getPropertyValue(internalProps.recurrence, recurrence, "none");
    recurrence_cadence = getPropertyValue(
      internalProps.recurrence_cadence,
      recurrence_cadence,
      ["none"],
    );
    capacity = getPropertyValue(internalProps.capacity, capacity, 1);
  }

  // Manifest properties requiring further manipulation:
  let emailIDs: string = "";
  let startDate: string = "0";
  let recurrenceCadence: string[] = [];

  let manifestProperties: { [key: string]: any }; // allows adding keys later

  $: manifestProperties = {
    event_title,
    event_description,
    event_location,
    event_conferencing,
    show_hosts,
    start_hour,
    end_hour,
    slot_size,
    start_date: new Date(startDate),
    dates_to_show,
    show_ticks,
    email_ids: parseStringToArray(emailIDs),
    allow_booking,
    max_bookable_slots,
    partial_bookable_ratio,
    show_as_week,
    show_weekends,
    attendees_to_show,
    notification_mode,
    notification_message,
    notification_subject,
    view_as,
    recurrence,
    capacity,
  };

  $: {
    manifestProperties.recurrence_cadence = recurrenceCadence;
  }

  $: console.table(manifestProperties);
  // #endregion mount and prop initialization

  function saveProperties() {
    console.log("Saving the following properties:");
    Object.entries(manifestProperties).forEach(([k, v]) => {
      console.log(k, v);
    });
  }
</script>

<style lang="scss">
</style>

{#if manifest && manifest.error}
  <nylas-domain-error {id} />
{:else}
  <div>
    <label>
      <strong>Event Title</strong>
      <input type="text" bind:value={manifestProperties.event_title} />
    </label>
  </div>
  <div>
    <label>
      <strong>Event Description</strong>
      <input type="text" bind:value={manifestProperties.event_description} />
    </label>
  </div>
  <div>
    <label>
      <strong>Event Location</strong>
      <input type="text" bind:value={manifestProperties.event_location} />
    </label>
  </div>
  <div>
    <label>
      <strong>Event Conferencing</strong>
      <input type="url" bind:value={manifestProperties.event_conferencing} />
    </label>
  </div>
  <div role="radiogroup" aria-labelledby="show_hosts">
    <strong id="show_hosts">Show meeting hosts to the end-user?</strong>
    <label>
      <input
        type="radio"
        name="show_hosts"
        value={"show"}
        bind:group={manifestProperties.show_hosts}
      />
      <span>Show Hosts</span>
    </label>
    <label>
      <input
        type="radio"
        name="show_hosts"
        value={"hide"}
        bind:group={manifestProperties.show_hosts}
      />
      <span>Hide Hosts</span>
    </label>
  </div>
  <div>
    <label>
      <strong>Start Hour</strong>
      <input
        type="range"
        min={0}
        max={24}
        step={1}
        bind:value={manifestProperties.start_hour}
      />
    </label>
  </div>
  <div>
    <label>
      <strong>End Hour</strong>
      <input
        type="range"
        min={0}
        max={24}
        step={1}
        bind:value={manifestProperties.end_hour}
      />
    </label>
  </div>
  <div role="radiogroup" aria-labelledby="slot_size">
    <strong id="slot_size">Timeslot size</strong>
    <label>
      <input
        type="radio"
        name="slot_size"
        value={15}
        bind:group={manifestProperties.slot_size}
      />
      <span>15 minutes</span>
    </label>
    <label>
      <input
        type="radio"
        name="slot_size"
        value={30}
        bind:group={manifestProperties.slot_size}
      />
      <span>30 minutes</span>
    </label>
    <label>
      <input
        type="radio"
        name="slot_size"
        value={60}
        bind:group={manifestProperties.slot_size}
      />
      <span>60 minutes</span>
    </label>
  </div>
  <div>
    <label>
      <strong>Start Date</strong>
      <input type="date" bind:value={startDate} />
    </label>
  </div>
  <div>
    <label>
      <strong>Days to show</strong>
      <input
        type="range"
        min={1}
        max={7}
        step={1}
        bind:value={manifestProperties.dates_to_show}
      />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="show_ticks">
    <strong id="show_ticks">Show ticks</strong>
    <label>
      <input
        type="checkbox"
        name="show_ticks"
        bind:checked={manifestProperties.show_ticks}
      />
    </label>
  </div>
  <div>
    <div>
      <strong id="email_ids">Email Ids to include for scheduling</strong>
    </div>
    <label>
      <textarea name="email_ids" bind:value={emailIDs} />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="allow_booking">
    <strong id="allow_booking">Allow booking</strong>
    <label>
      <input
        type="checkbox"
        name="allow_booking"
        bind:checked={manifestProperties.allow_booking}
      />
    </label>
  </div>
  <div>
    <label>
      <strong>Maximum slots that can be booked at once</strong>
      <input
        type="number"
        min={1}
        max={20}
        bind:value={manifestProperties.max_bookable_slots}
      />
    </label>
  </div>
  <div>
    <label>
      <strong>Participant Threshold / Partial bookable ratio</strong>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        bind:value={manifestProperties.partial_bookable_ratio}
      />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="show_as_week">
    <strong id="show_as_week">Show as week</strong>
    <label>
      <input
        type="checkbox"
        name="show_as_week"
        bind:checked={manifestProperties.show_as_week}
      />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="show_weekends">
    <strong id="show_weekends">Show weekends</strong>
    <label>
      <input
        type="checkbox"
        name="show_weekends"
        bind:checked={manifestProperties.show_weekends}
      />
    </label>
  </div>
  <div>
    <label>
      <strong>Attendees to show</strong>
      <input
        type="number"
        min={1}
        max={20}
        bind:value={manifestProperties.attendees_to_show}
      />
    </label>
  </div>
  <div role="radiogroup" aria-labelledby="notification_mode">
    <strong id="notification_mode"
      >How would you like to notify the customer on event creation?</strong
    >
    <label>
      <input
        type="radio"
        name="notification_mode"
        value={NotificationMode.SHOW_MESSAGE}
        bind:group={manifestProperties.notification_mode}
      />
      <span>Show Message on UI</span>
    </label>
    <label>
      <input
        type="radio"
        name="notification_mode"
        value={NotificationMode.SEND_MESSAGE}
        bind:group={manifestProperties.notification_mode}
      />
      <span>Send message via email</span>
    </label>
  </div>
  <div>
    <label>
      <strong>Notification message</strong>
      <input type="text" bind:value={manifestProperties.notification_message} />
    </label>
  </div>
  <div>
    <label>
      <strong>Notification Subject</strong>
      <input type="text" bind:value={manifestProperties.notification_subject} />
    </label>
  </div>
  <div role="radiogroup" aria-labelledby="view_as">
    <strong id="view_as">View as a Schedule, or as a List?</strong>
    <label>
      <input
        type="radio"
        name="view_as"
        bind:group={manifestProperties.view_as}
        value="schedule"
      />
      <span>Schedule</span>
    </label>
    <label>
      <input
        type="radio"
        name="view_as"
        bind:group={manifestProperties.view_as}
        value="list"
      />
      <span>List</span>
    </label>
  </div>
  <div role="radiogroup" aria-labelledby="recurrence">
    <strong id="recurrence"
      >Allow, Disallow, or Mandate events to repeat?</strong
    >
    <label>
      <input
        type="radio"
        name="recurrence"
        bind:group={manifestProperties.recurrence}
        value="none"
      />
      <span>Don't Repeat Events</span>
    </label>
    <label>
      <input
        type="radio"
        name="recurrence"
        bind:group={manifestProperties.recurrence}
        value="optional"
      />
      <span>Users May Repeat Events</span>
    </label>
    <label>
      <input
        type="radio"
        name="recurrence"
        bind:group={manifestProperties.recurrence}
        value="mandated"
      />
      <span>Events Always Repeat</span>
    </label>
  </div>
  {#if manifestProperties.recurrence === "mandated" || manifestProperties.recurrence === "optional"}
    <div role="radiogroup" aria-labelledby="recurrence_cadence">
      <strong id="recurrence_cadence"
        >How often should events repeat{#if manifestProperties.recurrence === "optional"},
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
  <div>
    <label>
      <strong>Capacity</strong>
      <input type="number" min={1} bind:value={manifestProperties.capacity} />
    </label>
  </div>
  <button on:click={saveProperties}>Save Editor Options</button>
{/if}
