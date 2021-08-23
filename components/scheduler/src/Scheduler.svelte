<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import {
    ManifestStore,
    EventStore,
    AvailabilityStore,
  } from "../../../commons/src";
  import { createEvent } from "@commons/connections/events";

  import { onMount, tick } from "svelte";
  import "../../availability/src/Availability.svelte";

  import {
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";

  import type { Manifest } from "@commons/types/Scheduler";
  import type { TimeSlot } from "@commons/types/Availability";
  import type { TimespanEvent, EventQuery } from "@commons/types/Events";

  // #region props
  export let id: string = "";
  export let access_token: string = "";
  export let availability_id: string;
  export let email_ids: string[];
  export let booking_label: string;
  // #endregion props

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
    availability_id = getPropertyValue(
      internalProps.availability_id,
      availability_id,
      "",
    );
    email_ids = getPropertyValue(internalProps.email_ids, email_ids, []);
    booking_label = getPropertyValue(
      internalProps.booking_label,
      booking_label,
      "Schedule",
    );
  }
  // #endregion mount and prop initialization

  let timeSlots: TimeSlot[] = [];

  function timeSlotChosen({ detail }: CustomEvent) {
    timeSlots = detail.timeSlots;
  }

  async function bookTimeSlots(events: TimeSlot[]) {
    const bookings = events.map(async (event) => {
      let postableEvent: Partial<TimespanEvent> = {
        title: "My test event",
        participants: [], // TODO: add to the participants array from availbility.event.available_calendars
        calendar_id: event.calendar_id,
        when: {
          object: "timespan",
          start_time: event.start_time.getTime() / 1000,
          end_time: event.end_time.getTime() / 1000,
        },
      };
      return await createEvent(
        postableEvent as TimespanEvent,
        {
          component_id: id,
          access_token,
        } as EventQuery,
      );
    });
    await Promise.all(bookings);
    timeSlots = [];
    // Reset the Availability store and force a re-render
    // TODO: it's possible that this isn't good enough / will involve a race condition between provider sync and return. Need to test.
    AvailabilityStore.reset();
    availability_id = availability_id;
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
      <button on:click={() => bookTimeSlots(timeSlots)}>{booking_label}</button>
    {/if}
  </section>
</main>
