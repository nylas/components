<svelte:options tag="nylas-schedule-editor" />

<script lang="ts">
  import { ManifestStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";

  import type { Manifest } from "@commons/types/ScheduleEditor";
  import {
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";

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
  }

  $: manifestProperties = {
    event_title,
    event_description,
    event_location,
    event_conferencing,
    show_hosts,
    start_hour,
    end_hour,
    slot_size,
    start_date,
    dates_to_show,
    show_ticks,
    email_ids,
    allow_booking,
    max_bookable_slots,
    partial_bookable_ratio,
    show_as_week,
    show_weekends,
    attendees_to_show,
  };
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
        bind:group={manifestProperties.show_hosts}
        value="show"
      />
      <span>Show Hosts</span>
    </label>
    <label>
      <input
        type="radio"
        name="show_hosts"
        bind:group={manifestProperties.show_hosts}
        value="hide"
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
        value={0}
        on:input={(e) => {
          manifestProperties.start_hour = e?.target?.value;
        }}
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
        value={24}
        on:input={(e) => {
          manifestProperties.end_hour = e?.target?.value;
        }}
      />
    </label>
  </div>
  <div role="radiogroup" aria-labelledby="show_hosts">
    <strong id="slot_size">Timeslot size</strong>
    <label>
      <input
        type="radio"
        name="slot_size"
        bind:group={manifestProperties.slot_size}
        value={15}
      />
      <span>15 minutes</span>
    </label>
    <label>
      <input
        type="radio"
        name="slot_size"
        bind:group={manifestProperties.slot_size}
        value={30}
      />
      <span>30 minutes</span>
    </label>
    <label>
      <input
        type="radio"
        name="slot_size"
        bind:group={manifestProperties.slot_size}
        value={60}
      />
      <span>60 minutes</span>
    </label>
  </div>
  <div>
    <label>
      <strong>Start Date</strong>
      <input
        type="date"
        value={new Date(start_date).toLocaleDateString("en-CA")}
        on:input={(e) => {
          const date = e?.target?.value;
          manifestProperties.start_date = date ? new Date(date) : new Date();
        }}
      />
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
        value={1}
        on:input={(e) => {
          manifestProperties.dates_to_show = e?.target?.value;
        }}
      />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="show_ticks">
    <strong id="show_ticks">Show ticks</strong>
    <label>
      <input
        type="checkbox"
        name="show_ticks"
        checked={manifestProperties.show_ticks}
        on:input={(e) => {
          manifestProperties.show_ticks = e?.target?.checked;
        }}
      />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="allow_booking">
    <strong id="allow_booking">Allow booking</strong>
    <label>
      <input
        type="checkbox"
        name="allow_booking"
        checked={manifestProperties.allow_booking}
        on:input={(e) => {
          manifestProperties.allow_booking = e?.target?.checked;
        }}
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
        value={8}
        on:input={(e) => {
          manifestProperties.max_bookable_slots = e?.target?.value;
        }}
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
        value={0}
        step={0.01}
        on:input={(e) => {
          manifestProperties.partial_bookable_ratio = e?.target?.value;
        }}
      />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="show_as_week">
    <strong id="show_as_week">Show as week</strong>
    <label>
      <input
        type="checkbox"
        name="show_as_week"
        checked={manifestProperties.show_as_week}
        on:input={(e) => {
          manifestProperties.show_as_week = e?.target?.checked;
        }}
      />
    </label>
  </div>
  <div role="checkbox" aria-labelledby="show_weekends">
    <strong id="show_weekends">Show weekends</strong>
    <label>
      <input
        type="checkbox"
        name="show_weekends"
        checked={manifestProperties.show_weekends}
        on:input={(e) => {
          manifestProperties.show_weekends = e?.target?.checked;
        }}
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
        value={5}
        on:input={(e) => {
          manifestProperties.attendees_to_show = e?.target?.value;
        }}
      />
    </label>
  </div>
  <button on:click={saveProperties}>Save Editor Options</button>
{/if}
