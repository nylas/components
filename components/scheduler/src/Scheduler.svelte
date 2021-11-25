<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import { ManifestStore, sendMessage } from "@commons";
  import { createEvent } from "@commons/connections/events";
  import { get_current_component } from "svelte/internal";
  import {
    buildInternalProps,
    getEventDispatcher,
  } from "@commons/methods/component";
  import { ConsecutiveAvailabilityStore } from "../../../commons/src";
  import { DefaultCustomFields } from "@commons/constants/custom-fields";
  import { timeHour, timeWeek, timeDay } from "d3-time";
  import { scaleTime } from "d3-scale";
  import type { Manifest, CustomField } from "@commons/types/Scheduler";
  import type { TimeSlot } from "@commons/types/Availability";
  import type { EventQuery, TimespanEvent } from "@commons/types/Events";
  import { NotificationMode } from "@commons/enums/Scheduler";
  import { onMount, tick } from "svelte";
  import { fetchConsecutiveAvailability } from "@commonsconnections/availability";

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

  export let booking_label: string;
  export let custom_fields: CustomField[];
  export let event_title: string;
  export let event_description: string;
  export let event_location: string;
  export let event_conferencing: string;
  export let slots_to_book: BookableSlot[];
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
  // #endregion props

  //#region mount and prop initialization
  const defaultValueMap: Partial<Manifest> = {
    booking_label: "Schedule time slots",
    custom_fields: DefaultCustomFields,
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
  };

  let _this: Manifest = <Manifest>buildInternalProps({}, {}, defaultValueMap);
  let manifest: Partial<Manifest> = {};

  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({
      component_id: id,
      access_token,
    });
    manifest = (await $ManifestStore[storeKey]) || {};

    _this = buildInternalProps($$props, manifest, defaultValueMap) as Manifest;
  });

  let previousProps = $$props;
  $: {
    if (JSON.stringify(previousProps) !== JSON.stringify($$props)) {
      _this = buildInternalProps(
        $$props,
        manifest,
        defaultValueMap,
      ) as Manifest;
      previousProps = $$props;
    }
  }

  let startDay: Date = timeDay.floor(new Date()); // the first day column shown; depends on show_as_week

  function showNextDay() {
    startDay = timeDay.offset(startDay, 1);
  }

  function showPreviousDay() {
    startDay = timeDay.offset(startDay, -1);
  }

  let currentIndexOfConsecutiveAvailableSlots = 0;
  $: console.log(startDay);

  $: (async () => {
    if (Array.isArray(_this.events) && _this.events.length > 0 && startDay) {
      const emailsList = _this.events.reduce((emails, event) => {
        emails.push(event.email_ids);
        return emails;
      }, []);

      // Pick the duration_minutes from the first block slot
      // TODO: Need to be updated when API can handle different slot size per meeting
      const duration_minutes = _this.events[0].slot_size;
      const eventDetails = {
        duration_minutes,
        interval_minutes: 10,
        start_time:
          timeHour(
            new Date(new Date(startDay).setHours(_this.start_hour)),
          ).getTime() / 1000,
        end_time:
          timeHour(
            new Date(new Date(startDay).setHours(_this.end_hour)),
          ).getTime() / 1000,
        free_busy: [],
        emails: emailsList,
      };
      const fecthedAvailabileSlots = await $ConsecutiveAvailabilityStore[
        JSON.stringify({
          ...{ body: eventDetails, component_id: id, access_token },
          forceReload: true,
        })
      ];
      console.log(fecthedAvailabileSlots);

      if (fecthedAvailabileSlots.length) {
        slotsToBook =
          fecthedAvailabileSlots[currentIndexOfConsecutiveAvailableSlots];
      } else {
        slotsToBook = [];
      }
    }
  })();

  const dispatchEvent = getEventDispatcher(get_current_component());
  // #endregion mount and prop initialization

  let showSuccessNotification = false;

  $: slotsToBook = _this.slots_to_book.map((slot) => {
    if (!slot.recurrence_cadence) {
      if (_this.recurrence === "required") {
        slot.recurrence_cadence = _this.recurrence_cadence[0];
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
    showSuccessNotification = false;
  }

  async function bookTimeSlots(events: BookableSlot[]) {
    const bookings = events.map(async (event) => {
      let postableEvent: Partial<TimespanEvent> = {
        title: _this.event_title,
        description: _this.event_description,
        location: _this.event_location,
        conferencing: _this.event_conferencing
          ? {
              provider: "Zoom Meeting", // TODO: make this dynamic
              details: {
                url: _this.event_conferencing,
              },
            }
          : undefined,
        participants: event.available_calendars.map((calendar) => {
          return {
            email: calendar,
          };
        }),
        calendar_id: event.calendar_id,
        when: {
          start_time: event.start_time.getTime() / 1000,
          end_time: event.end_time.getTime() / 1000,
        },
      };

      if (customFieldResponses["Email Address"]) {
        postableEvent.participants?.push({
          email: customFieldResponses["Email Address"],
          name: customFieldResponses["Your Name"],
        });
      }

      if (Object.keys(customFieldResponses).length) {
        postableEvent.metadata = customFieldResponses;
      }

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
        const expiry = _this.recurrence_expiry || event.recurrence_expiry;
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

    if (_this.notification_mode === NotificationMode.SEND_MESSAGE) {
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
            body: `${_this.notification_message}`,
            subject: `${_this.notification_subject}`,
          });
        }
      });
    } else if (_this.notification_mode === NotificationMode.SHOW_MESSAGE) {
      showSuccessNotification = true;
    }
  }

  // #region custom fields
  let customFieldResponses: Record<string, any> = {}; // ideally "any" would be "string | boolean", but text inputs cast to many types
  $: if (
    !_this.custom_fields.find((field) =>
      customFieldResponses.hasOwnProperty(field.title),
    )
  ) {
    customFieldResponses = _this.custom_fields.reduce((responses, field) => {
      return { ...responses, [field.title]: "" };
    }, {});
  }

  $: requiredFieldsFilled = _this.custom_fields
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
            <h3>{_this.event_title}: {_this.event_description}</h3>
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
            {#if _this.recurrence !== "none"}
              <footer>
                {#if _this.recurrence === "optional"}
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
                    {#each _this.recurrence_cadence as cadence}
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
                {:else if _this.recurrence === "required"}
                  <strong>Repeating {timeSlot.recurrence_cadence}</strong>
                {/if}
                {#if timeSlot.recurrence_cadence !== "none" && !_this.recurrence_expiry}
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
      {#if _this.custom_fields.length}
        <div id="custom-fields">
          {#each _this.custom_fields as field}
            {#if field.type === "email"}
              <label data-required={field.required}>
                <strong>{field.title}</strong>
                <!-- TODO: see if we can make type="text" dynamic for email case. Svelte doesnt care for it as is. -->
                <input
                  type="email"
                  bind:value={customFieldResponses[field.title]}
                />
              </label>
            {:else}
              <label data-required={field.required}>
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
        title={!requiredFieldsFilled
          ? "Please complete all required fields"
          : undefined}
        class="book"
        on:click={() => bookTimeSlots(slotsToBook)}
        >{_this.booking_label}</button
      >
    {:else}
      <p>
        Select timeslots to view event information (You'll be able to review
        before you book)
      </p>
    {/if}
    <button class="book" on:click={showNextDay}>Show Next Day</button>
    <button class="book" on:click={showPreviousDay}>Show Previous Day</button>
    {#if showSuccessNotification}
      <p>{_this.notification_message}</p>
    {/if}
  </section>
</main>
