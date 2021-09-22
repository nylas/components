<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import { ManifestStore, AvailabilityStore, sendMessage } from "@commons";
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
  import { NotificationMode } from "@commons/enums/Scheduler";
  import { onMount, tick } from "svelte";

  // #region props
  export let id: string = "";
  export let access_token: string = "";
  export let availability_id: string;
  export let editor_id: string;
  export let email_ids: string[];
  export let booking_label: string;
  export let event_title: string;
  export let event_description: string;
  export let event_location: string;
  export let event_conferencing: string;
  export let slots_to_book: TimeSlot[] = [];
  export let notification_mode: NotificationMode;
  export let notification_message: string;
  export let notification_subject: string;
  // #endregion props

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  let editorManifest: Partial<EditorManifest> = {};

  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({
      component_id: id,
      access_token,
      external_manifest_ids: [editor_id],
    });
    manifest = (await $ManifestStore[storeKey]) || {};

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
      "Schedule time slots",
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
    event_location = getPropertyValue(
      internalProps.event_location,
      event_location,
      "",
    );
    event_conferencing = getPropertyValue(
      internalProps.event_conferencing,
      event_conferencing,
      "",
    );
    slots_to_book = getPropertyValue(
      internalProps.slots_to_book,
      slots_to_book,
      [],
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
  }

  const dispatchEvent = getEventDispatcher(get_current_component());
  // #endregion mount and prop initialization

  let show_success_notification = false;
  $: if (slots_to_book.length) {
    show_success_notification = false;
  }

  async function bookTimeSlots(events: TimeSlot[]) {
    const bookings = events.map(async (event) => {
      let postableEvent: Partial<TimespanEvent> = {
        title: event_title,
        description: event_description,
        location: event_location,
        conferencing: {
          provider: "Zoom Meeting", // TODO: make this dynamic
          details: {
            url: event_conferencing,
          },
        },
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
    const eventBookings = await Promise.all(bookings);

    dispatchEvent("bookedEvents", {});

    if (notification_mode === NotificationMode.SEND_MESSAGE) {
      eventBookings.map((event, i) => {
        console.log(`event ${i}`, event);
        const event_participants = event.participants?.map((participant) => {
          const { email, name } = participant;
          let to: { email: string; name?: string } = { email };
          if (name) to["name"] = name; // Only assign name if not null, else we get error
          return to;
        });
        if (event_participants) {
          sendMessage(id, {
            to: event_participants,
            body: `${notification_message}`,
            subject: `${notification_subject}`,
          });
        }
      });
    } else if (notification_mode === NotificationMode.SHOW_MESSAGE) {
      show_success_notification = true;
    }
    // Reset the Availability store and force a re-render
    // TODO: it's possible that this isn't good enough / will involve a race condition between provider sync and return. Need to test.
    AvailabilityStore.reset();
    availability_id = availability_id;
  }
</script>

<style lang="scss">
  @import "../../theming/reset.scss";
  @import "../../theming/variables.scss";

  main {
    height: 100%;
    overflow: hidden;
    display: grid;
    font-family: Arial, Helvetica, sans-serif;
    position: relative;
    z-index: 1;

    .booker {
      height: 100%;
      overflow: auto;
      background: rgba(0, 0, 0, 0.03);
      padding: 1rem;

      h2 {
        font-size: 1.3rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }

      & > p {
        opacity: 0.8;
        font-size: 0.9rem;
        line-height: 1.3rem;
        margin-bottom: 1rem;
      }

      .timeslots {
        display: grid;
        grid-auto-flow: row;
        gap: 1rem;
        margin-bottom: 1rem;

        li {
          background: rgba(255, 255, 255, 0.8);
          list-style-type: none;
          margin: 0;
          padding: 1rem;
          border: 1px solid #ebebeb;
          display: grid;
          gap: 0.5rem;
          grid-auto-flow: row;

          h3 {
            font-size: 0.8rem;
            opacity: 0.8;
          }
          .time {
            color: var(--blue);
          }
          .date {
            font-size: 0.8rem;
          }
        }
      }

      button.book {
        background: var(--blue);
        color: white;
        padding: 0.5rem 2rem;
        cursor: pointer;
      }
    }
  }
</style>

<nylas-error {id} />
<main>
  <section class="booker">
    <h2>Your Appointment Bookings</h2>
    {#if slots_to_book.length}
      <p>Do you want to book the following?</p>
      <ul class="timeslots">
        {#each slots_to_book as timeSlot}
          <li>
            <h3>{event_title}: {event_description}</h3>
            <span class="time"
              >{timeSlot.start_time.toLocaleTimeString([], {
                timeStyle: "short",
              })}
              -
              {timeSlot.end_time.toLocaleTimeString([], {
                timeStyle: "short",
              })}</span
            >
            <span class="date"
              >{timeSlot.start_time.toLocaleDateString("default", {
                dateStyle: "full",
              })}</span
            >
          </li>
        {/each}
      </ul>
      <button class="book" on:click={() => bookTimeSlots(slots_to_book)}
        >{booking_label}</button
      >
    {:else}
      <p>
        Select timeslots to view event information (You'll be able to review
        before you book)
      </p>
    {/if}
    {#if show_success_notification}
      <p>{notification_message}</p>
    {/if}
  </section>
</main>
