<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import { ManifestStore, EventStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";
  import "../../availability/src/Availability.svelte";

  import {
    getEventDispatcher,
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";

  import type { Manifest } from "@commons/types/Scheduler";

  // #region props
  export let id: string = "";
  export let access_token: string = "";
  export let availability_id: string;
  export let email_ids: string[];
  // #endregion props

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  onMount(async () => {
    await tick();
    // clientHeight = main?.getBoundingClientRect().height;
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
    availability_id = getPropertyValue(
      internalProps.availability_id,
      availability_id,
      "",
    );
    email_ids = getPropertyValue(internalProps.email_ids, email_ids, []);
  }
  // #endregion mount and prop initialization

  let timeSlots = [];
  let calendarID = "";

  function timeSlotChosen({ detail }) {
    console.log(
      "timeslots chosen",
      detail.timeSlots,
      detail.calendarID,
      detail,
    );
    timeSlots = detail.timeSlots;
    calendarID = detail.calendarID;
  }

  function bookTimeSlots(events) {
    events.forEach((event) => {
      console.log("booking", event);
      let postableEvent = {
        title: "My test event",
        calendar_id: calendarID,
        when: {
          start_time: event.start_time.getTime() / 1000,
          end_time: event.end_time.getTime() / 1000,
        },
      };
      EventStore.createEvent(postableEvent, {
        component_id: id,
        access_token,
        calendarIDs: [calendarID],
      });
    });
  }
</script>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: 2fr 1fr;
    height: 100%;
    gap: 1rem;
  }
</style>

<nylas-error {id} />
<main>
  <nylas-availability
    show_as_week={true}
    {email_ids}
    allow_booking={true}
    max_bookable_slots={4}
    id={availability_id}
    on:timeSlotChosen={timeSlotChosen}
  />
  <section class="booker">
    <h2>Event-bookable details to follow here</h2>
    {#if timeSlots.length}
      <p>Book the following?</p>
      <ul>
        {#each timeSlots as timeSlot}
          <li>
            {timeSlot.start_time.toLocaleString()} to {timeSlot.end_time.toLocaleString()}
          </li>
        {/each}
      </ul>
      <button on:click={() => bookTimeSlots(timeSlots)}>Book em</button>
    {/if}
  </section>
</main>
