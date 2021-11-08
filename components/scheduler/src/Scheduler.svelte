<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import { ManifestStore, sendMessage } from "@commons";
  import { createEvent } from "@commons/connections/events";
  import { get_current_component } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";

  import type { Manifest, CustomField } from "@commons/types/Scheduler";
  import type { TimeSlot } from "@commons/types/Availability";
  import type { EventQuery, TimespanEvent } from "@commons/types/Events";
  import { NotificationMode } from "@commons/enums/Scheduler";
  import { onMount, tick } from "svelte";

  interface BookableSlot extends TimeSlot {
    recurrence_cadence?:
      | "none"
      | "daily"
      | "weekdays"
      | "biweekly"
      | "weekly"
      | "monthly";
    recurrence_expiry?: Date | string | undefined;
    expirySelection: string;
  }

  // #region props
  export let id: string = "";
  export let access_token: string = "";
  export let availability_id: string;
  export let email_ids: string[];
  export let booking_label: string;
  export let event_title: string;
  export let event_description: string;
  export let event_location: string;
  export let event_conferencing: string;
  export let slots_to_book: BookableSlot[] = [];
  export let notification_mode: NotificationMode;
  export let notification_message: string;
  export let notification_subject: string;
  export let recurrence: "none" | "required" | "optional";
  export let recurrence_cadence: (
    | "none"
    | "daily"
    | "weekdays"
    | "weekly"
    | "biweekly"
    | "monthly"
  )[];
  export let recurrence_expiry: Date | string | null;

  export let custom_fields: CustomField[]; // TODO
  // #endregion props

  //#region mount and prop initialization
  const defaultValueMap = {
    availability_id: "",
    email_ids: [],
    booking_label: "Schedule time slots",
    event_title: "Meeting",
    event_description: "",
    event_conferencing: "",
    event_location: "",
    slots_to_book: [],
    notification_mode: NotificationMode.SHOW_MESSAGE,
    notification_message: "Thank you for scheduling!",
    notification_subject: "Invitation",
    recurrence: "none",
    recurrence_cadence: ["none"],
    custom_fields: [
      {
        title: "Your Name",
        type: "text",
        required: false,
      },
      {
        title: "Email Address",
        type: "text",
        required: true,
        placeholder: "you@example.com",
      },
    ],
  };

  let internalProps: Manifest = <any>{};
  let manifest: Partial<Manifest> = {};

  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({
      component_id: id,
      access_token,
    });
    manifest = (await $ManifestStore[storeKey]) || {};

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

    availability_id = internalProps.availability_id;
    email_ids = internalProps.email_ids;
    booking_label = internalProps.booking_label;
    event_title = internalProps.event_title;
    event_description = internalProps.event_description;
    event_location = internalProps.event_location;
    event_conferencing = internalProps.event_conferencing;
    slots_to_book = internalProps.slots_to_book;
    notification_mode = internalProps.notification_mode;
    notification_message = internalProps.notification_message;
    notification_subject = internalProps.notification_subject;
    recurrence = internalProps.recurrence;
    recurrence_cadence = internalProps.recurrence_cadence;
    recurrence_expiry = internalProps.recurrence_expiry;
    custom_fields = internalProps.custom_fields;
  }

  const dispatchEvent = getEventDispatcher(get_current_component());
  // #endregion mount and prop initialization

  let show_success_notification = false;
  $: slotsToBook = slots_to_book.map((slot) => {
    if (!slot.recurrence_cadence) {
      if (recurrence === "required") {
        slot.recurrence_cadence = recurrence_cadence[0];
      } else {
        slot.recurrence_cadence = "none";
      }
    }
    if (!slot.expirySelection) {
      slot.expirySelection = "none";
    }
    return slot;
  });
  $: if (slotsToBook.length) {
    show_success_notification = false;
  }

  async function bookTimeSlots(events: BookableSlot[]) {
    const bookings = events.map(async (event) => {
      let postableEvent: Partial<TimespanEvent> = {
        title: event_title,
        description: event_description,
        location: event_location,
        conferencing: event_conferencing
          ? {
              provider: "Zoom Meeting", // TODO: make this dynamic
              details: {
                url: event_conferencing,
              },
            }
          : undefined,
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

      if (event.recurrence_cadence && event.recurrence_cadence !== "none") {
        let rrule: string = "";
        if (event.recurrence_cadence === "daily") {
          rrule = "RRULE:FREQ=DAILY";
        } else if (event.recurrence_cadence === "weekdays") {
          rrule = "RRULE:FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR";
        } else if (event.recurrence_cadence === "weekly") {
          rrule = "RRULE:FREQ=WEEKLY";
        } else if (event.recurrence_cadence === "biweekly") {
          rrule = "RRULE:FREQ=WEEKLY;INTERVAL=2";
        } else if (event.recurrence_cadence === "monthly") {
          rrule = "RRULE:FREQ=MONTHLY";
        }
        // Convert date input to Date type
        if (typeof event.recurrence_expiry === "string") {
          event.recurrence_expiry = new Date(event.recurrence_expiry as string);
        }
        const expiry = recurrence_expiry || event.recurrence_expiry;
        const expiryInt = Number.parseInt(<string>expiry);

        if (!isNaN(expiryInt)) {
          rrule += `;COUNT=${expiryInt}`;
        } else if (expiry instanceof Date) {
          rrule += `;UNTIL=${expiry
            .toISOString()
            .substring(0, 19) // Remove MS from time string
            .replace(/[^0-9]/g, "")}Z`;
        }
        postableEvent.recurrence = {
          rrule: [rrule],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
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
    availability_id = availability_id;
  }

  // #region custom fields
  let customFieldResponses: Record<string, any> = {}; // ideally "any" would be "string | boolean", but text inputs cast to many types
  $: if (
    !custom_fields.find((field) =>
      customFieldResponses.hasOwnProperty(field.title),
    )
  ) {
    customFieldResponses = custom_fields.reduce((responses, field) => {
      return { ...responses, [field.title]: "" };
    }, {});
  }

  $: requiredFieldsFilled = custom_fields
    .filter((field) => field.required)
    .every(
      (field) =>
        customFieldResponses[field.title] !== undefined &&
        customFieldResponses[field.title] !== "",
    );
  // #endregion custom fields
</script>

<style lang="scss">
  @import "./styles/scheduler.scss";
</style>

<nylas-error {id} />
<main>
  <section class="booker">
    <h2>Your Appointment Bookings</h2>
    {#if slotsToBook.length}
      <p>Do you want to book the following?</p>
      <ul class="timeslots">
        {#each slotsToBook as timeSlot}
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
            {#if recurrence !== "none"}
              <footer>
                {#if recurrence === "optional"}
                  <strong>How often should this event repeat?</strong>
                  <div class="cadences">
                    <label
                      class:checked={timeSlot.recurrence_cadence === "none"}
                    >
                      <input
                        type="radio"
                        value="none"
                        bind:group={timeSlot.recurrence_cadence}
                      />
                      <span>never</span>
                    </label>
                    {#each recurrence_cadence as cadence}
                      <label
                        class:checked={timeSlot.recurrence_cadence === cadence}
                      >
                        <input
                          type="radio"
                          value={cadence}
                          bind:group={timeSlot.recurrence_cadence}
                        />
                        <span>{cadence}</span>
                      </label>
                    {/each}
                  </div>
                {:else if recurrence === "required"}
                  <strong>Repeating {timeSlot.recurrence_cadence}</strong>
                {/if}
                {#if timeSlot.recurrence_cadence !== "none" && !recurrence_expiry}
                  <strong>Ends</strong>
                  <div class="expiry">
                    <label class:checked={timeSlot.expirySelection === "none"}>
                      <input
                        type="radio"
                        value="none"
                        bind:group={timeSlot.expirySelection}
                      />
                      <span>never</span>
                    </label>
                    <label class:checked={timeSlot.expirySelection === "after"}>
                      <input
                        type="radio"
                        value="after"
                        bind:group={timeSlot.expirySelection}
                      />
                      <span>After</span>
                      {#if timeSlot.expirySelection === "after"}
                        <input
                          class="after"
                          type="number"
                          min="1"
                          bind:value={timeSlot.recurrence_expiry}
                        />
                        <span>occurrences</span>
                      {/if}
                    </label>
                    <label class:checked={timeSlot.expirySelection === "on"}>
                      <input
                        type="radio"
                        value="on"
                        bind:group={timeSlot.expirySelection}
                      />
                      <span>On</span>
                      {#if timeSlot.expirySelection === "on"}
                        <input
                          type="date"
                          min={timeSlot.start_time
                            .toISOString()
                            .substring(0, 10)}
                          bind:value={timeSlot.recurrence_expiry}
                        />
                      {/if}
                    </label>
                  </div>
                {/if}
              </footer>
            {/if}
          </li>
        {/each}
      </ul>
      {#if custom_fields.length}
        <div id="custom-fields">
          {#each custom_fields as field}
            {#if field.type === "email"}
              <label>
                <strong>{field.title}</strong>
                <!-- TODO: see if we can make type="text" dynamic for email case. Svelte doesnt care for it as is. -->
                <input
                  type="email"
                  bind:value={customFieldResponses[field.title]}
                />
              </label>
            {:else}
              <label>
                <strong>{field.title}</strong>
                <input
                  type="text"
                  bind:value={customFieldResponses[field.title]}
                />
              </label>
            {/if}
          {/each}
        </div>
      {/if}
      <button
        disabled={!requiredFieldsFilled}
        class="book"
        on:click={() => bookTimeSlots(slotsToBook)}>{booking_label}</button
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
