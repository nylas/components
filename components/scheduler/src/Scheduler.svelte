<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import {
    ManifestStore,
    EventStore,
    AvailabilityStore,
    fetchManifest,
  } from "../../../commons/src";
  import { createEvent } from "@commons/connections/events";
  import { get_current_component } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
    getPropertyValue,
  } from "@commons/methods/component";

  import type { Manifest as EditorManifest } from "@commons/types/ScheduleEditor";
  import type { Manifest } from "@commons/types/Scheduler";
  import type { TimeSlot } from "@commons/types/Availability";
  import type { EventQuery, TimespanEvent } from "@commons/types/Events";
  import { onMount, tick } from "svelte";
  import "../../availability/src/Availability.svelte";

  // #region props
  export let id: string = "";
  export let access_token: string = "";
  export let availability_id: string;
  export let editor_id: string;
  export let email_ids: string[];
  export let booking_label: string;
  export let event_title: string;
  export let event_description: string;
  export let slots_to_book: TimeSlot[] = [];
  // #endregion props

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  let editorManifest: Partial<EditorManifest> = {};

  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};

    if (editor_id) {
      editorManifest = await fetchManifest(editor_id);
    }

    internalProps = buildInternalProps($$props, manifest) as Partial<Manifest>;
  });

  $: console.log({ editorManifest });

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
    editor_id = getPropertyValue(internalProps.editor_id, editor_id, "");
    email_ids = getPropertyValue(internalProps.email_ids, email_ids, []);
    booking_label = getPropertyValue(
      internalProps.booking_label,
      booking_label,
      "Schedule",
    );
    event_title = getPropertyValue(
      internalProps.event_title || editorManifest.event_title,
      event_title,
      "Meeting",
    );
    event_description = getPropertyValue(
      internalProps.event_description,
      event_description,
      "",
    );
    slots_to_book = getPropertyValue(
      internalProps.slots_to_book,
      slots_to_book,
      [],
    );
  }

  const dispatchEvent = getEventDispatcher(get_current_component());
  // #endregion mount and prop initialization

  async function bookTimeSlots(events: TimeSlot[]) {
    const bookings = events.map(async (event) => {
      let postableEvent: Partial<TimespanEvent> = {
        title: event_title,
        description: event_description,
        participants: event.available_calendars.map((c) => {
          return {
            email: c,
          };
        }),
        calendar_id: event.calendar_id,
        when: {
          start_time: event.start_time.getTime() / 1000,
          end_time: event.end_time.getTime() / 1000,
        },
      };
      return createEvent(
        postableEvent as TimespanEvent,
        {
          component_id: id,
          access_token,
        } as EventQuery,
      );
    });
    await Promise.all(bookings);

    dispatchEvent("bookedEvents");

    // Reset the Availability store and force a re-render
    // TODO: it's possible that this isn't good enough / will involve a race condition between provider sync and return. Need to test.
    AvailabilityStore.reset();
    availability_id = availability_id;
  }
</script>

<nylas-error {id} />
<main>
  <section class="booker">
    <h2>Event-bookable details to follow here</h2>
    {#if slots_to_book.length}
      <p>Book the following?</p>
      <ul>
        {#each slots_to_book as timeSlot}
          <li>
            <h3>{event_title}: {event_description}</h3>
            {timeSlot.start_time.toLocaleString()} to {timeSlot.end_time.toLocaleString()}
          </li>
        {/each}
      </ul>
      <button on:click={() => bookTimeSlots(slots_to_book)}
        >{booking_label}</button
      >
    {/if}
  </section>
</main>
