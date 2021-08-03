<svelte:options tag="nylas-availability" />

<script lang="ts">
  import { ManifestStore, AvailabilityStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";
  import { get_current_component } from "svelte/internal";
  import { getEventDispatcher } from "@commons/methods/component";
  import type { TimeInterval } from "d3-time";
  import { timeDay, timeHour, timeMinute } from "d3-time";
  import { scaleTime } from "d3-scale";
  import {
    Calendar,
    Manifest,
    SelectionStatus,
    TimeSlot,
    SelectableSlot,
    AvailabilityStatus,
    AvailabilityQuery,
    EventQuery,
  } from "@commons/types/Availability";

  //#region props
  export let id: string = "";
  export let access_token: string = "";
  export let start_hour: number = 0;
  export let end_hour: number = 24;
  export let slot_size: number = 15; // in minutes
  export let start_date: Date = new Date();
  export let dates_to_show: number = 1;
  export let calendars: Calendar[] = [];
  export let show_ticks: boolean = true;
  export let email_ids: string[] = [];
  export let allow_booking: boolean = false;
  //#endregion props

  //#region mount
  let manifest: Partial<Manifest> = {};
  onMount(async () => {
    await tick();
    clientHeight = main?.getBoundingClientRect().height;
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};
  });
  //#endregion mount

  const dispatchEvent = getEventDispatcher(get_current_component());

  //#region layout
  let main: Element;
  let clientHeight: number;

  let slotSelection: Availability.TimeSlot = [];

  // You can have as few as 1, and as many as 7, days shown
  $: startDay = timeDay.floor(start_date);
  $: endDay = timeDay.offset(start_date, dates_to_show - 1);
  // map over the ticks() of the time scale between your start day and end day
  // populate them with as many slots as your start_hour, end_hour, and slot_size dictate
  $: generateDaySlots = function (
    timestamp: Date,
    start_hour: number,
    end_hour: number,
  ) {
    const dayStart = timeHour(
      new Date(new Date(timestamp).setHours(start_hour)),
    );
    const dayEnd = timeHour(new Date(new Date(timestamp).setHours(end_hour)));
    return scaleTime()
      .domain([dayStart, dayEnd])
      .ticks(timeMinute.every(slot_size) as TimeInterval)
      .slice(0, -1) // dont show the 25th hour
      .map((time) => {
        const endTime = timeMinute.offset(time, slot_size);
        const freeCalendars: string[] = [];

        let availability = AvailabilityStatus.FREE; // default
        let allCalendars = [
          ...calendars,
          ...newCalendarTimeslotsForGivenEmails,
        ];
        if (allCalendars.length) {
          allCalendars.forEach((c) => {
            let availabilityExistsInSlot = c.timeslots.some(
              (slot) => time >= slot.start_time && endTime <= slot.end_time,
            );
            if (c.availability === AvailabilityStatus.BUSY) {
              if (!availabilityExistsInSlot) {
                freeCalendars.push(c.emailAddress);
              }
            } else if (
              c.availability === AvailabilityStatus.FREE ||
              !c.availability
            ) {
              // if they pass in a calendar, but don't have availability, assume the timeslots are available.
              if (availabilityExistsInSlot) {
                freeCalendars.push(c.emailAddress);
              }
            }
          });
        }

        if (allCalendars.length) {
          if (freeCalendars.length) {
            if (freeCalendars.length === allCalendars.length) {
              availability = AvailabilityStatus.FREE;
            } else {
              availability = AvailabilityStatus.PARTIAL;
            }
          } else {
            availability = AvailabilityStatus.BUSY;
          }
        }

        return {
          selectionStatus: SelectionStatus.UNSELECTED,
          availability: availability,
          available_calendars: freeCalendars,
          start_time: time,
          end_time: endTime,
        };
      });
  };

  let ticks: Date[] = [];

  const minimumTickHeight = 30; // minimum pixels between ticks, vertically
  const slotSizes = [15, 30, 60, 180, 360]; // we only want to show ticks in intervals of 15 mins, 30 mins, 60 mins, 3 hours, or 6 hours.

  $: ticks = generateTicks(
    clientHeight,
    days[0].slots.map((s) => s.start_time),
  );

  // We don't want to show all 96 15-minute intervals unless the user has a real tall screen.
  // So let's be smart about it and filter on modification of start_time, end_time, slot_size, or clientHeight
  // generateTicks() is a recursive func that retries if a minimumTickHeight threshold is not met
  // Calculation goal of < 5ms -- console.timers kept in place for future development testing.
  const generateTicks = (
    height: number,
    ticks: Date[],
    intervalCounter: number = 0,
  ): Date[] => {
    // console.time('ticks')
    const tickIters = slotSizes[intervalCounter];

    // ternary here because timeMinute.every(120) doesnt work, but timeHour.every(2) does.
    let timeInterval =
      tickIters > 60
        ? timeHour.every(tickIters / 60)
        : timeMinute.every(tickIters);

    ticks = scaleTime()
      .domain(ticks)
      .ticks(timeInterval as TimeInterval);

    const averageTickHeight = height / ticks.length;

    if (
      tickIters < slot_size || // dont show 15-min ticks if slot size is hourly
      (averageTickHeight < minimumTickHeight && // make sure ticks're at least yea-pixels tall
        intervalCounter < slotSizes.length) // don't try to keep going if youve reached every 6 hours. Subdividing a day into fewer than 4 parts doesn't yield a nice result.
    ) {
      return generateTicks(height, ticks, intervalCounter + 1);
    } else {
      // console.timeEnd('ticks')
      return ticks;
    }
  };

  $: days = scaleTime()
    .domain([startDay, endDay])
    .ticks(timeDay)
    .map((timestamp) => {
      let slots = generateDaySlots(timestamp, start_hour, end_hour);
      console.timeEnd("day");
      return {
        slots,
        timestamp,
      };
    });
  //#endregion layout

  $: newCalendarTimeslotsForGivenEmails = [];
  let availabilityQuery: AvailabilityQuery;

  $: (async () => {
    if (email_ids?.length) {
      newCalendarTimeslotsForGivenEmails = await getAvailability();
    }
    // When dates_to_show is updated, update availability
    if (email_ids?.length && dates_to_show) {
      newCalendarTimeslotsForGivenEmails = await getAvailability();
    }
  })();

  async function getAvailability() {
    let freeBusyCalendars: any = [];
    availabilityQuery = {
      body: {
        emails: email_ids,
        start_time:
          new Date(new Date(startDay).setHours(start_hour)).getTime() / 1000,
        end_time:
          new Date(new Date(endDay).setHours(end_hour)).getTime() / 1000,
      },
      component_id: id,
    };
    // Free-Busy endpoint returns busy timeslots for given email_ids between start_time & end_time
    const consolidatedAvailabilityForGivenDay =
      await AvailabilityStore.getAvailability(availabilityQuery);
    if (consolidatedAvailabilityForGivenDay?.length) {
      consolidatedAvailabilityForGivenDay.forEach((user) => {
        freeBusyCalendars.push({
          emailAddress: user.email,
          availability: AvailabilityStatus.BUSY,
          timeslots: user.time_slots.map((_slot) => ({
            start_time: new Date(_slot.start_time * 1000),
            end_time: new Date(_slot.end_time * 1000),
          })),
        });
      });
    }
    return freeBusyCalendars;
  }
  //#region event query
  let query: Availability.EventQuery;
  $: query = {
    component_id: id,
    access_token: access_token,
    calendar_id: "",
    participants: [{ email_address: "" }],
  };
  //#region event query

  //#region booking event logic for single time slot and consecutive time slots
  $: sortedSlots = [
    ...slotSelection.sort((a, b) => a.start_time > b.start_time),
  ].reduce((events, currentTimeSlot, i) => {
    if (i === 0) {
      events = [currentTimeSlot];
    } else {
      let lastMergedSlot = events[events.length - 1];
      if (currentTimeSlot.start_time <= lastMergedSlot.end_time) {
        lastMergedSlot.end_time = new Date(
          Math.max(lastMergedSlot.end_time, currentTimeSlot.end_time),
        );
      } else {
        events = [...events, currentTimeSlot];
      }
    }
    return events;
  }, []);

  function toggleSelectedTimeSlots(selectedSlot: obj) {
    return (slotSelection =
      selectedSlot.selectionStatus === SelectionStatus.SELECTED
        ? [...slotSelection, selectedSlot]
        : slotSelection.filter((slot) => slot != selectedSlot));
  }

  function sortAndSetEvent(slots: obj[]) {
    dispatchEvent("timeSlotChosen", { timeSlots: [...slots] });
    if (allow_booking) {
      // EventStore.createEvent(slots, query); // currently doesnt' work as calendar ID is not avaialble (To be completed by a different story)
    }
    slotSelection = [];
  }
  //#region booking event logic for single time slot or consecutive time slots
</script>

<style lang="scss">
  $headerHeight: 50px;
  main {
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;

    &.ticked {
      grid-template-columns: auto 1fr;
    }

    .days {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: auto;
    }

    .ticks {
      display: grid;
      grid-auto-flow: row;
      grid-auto-rows: auto;
      height: calc(100% - #{$headerHeight});
      list-style-type: none;
      margin: 0;
      padding: 0;
      overflow: hidden;
      padding-top: $headerHeight;
      font-size: 0.6rem;
      font-family: sans-serif;
      // text-align: right;

      li {
        display: block;
        position: relative;
        height: auto;
        overflow: hidden;
        padding: 0 0.25rem;
        display: grid;
        // align-content: center;
        justify-content: right;
      }
    }

    .day {
      display: grid;
      grid-template-rows: $headerHeight 1fr;

      h2 {
        margin: 0;
        padding: 0;
        text-align: center;
      }

      .slots {
        display: grid;
        grid-auto-flow: row;
        grid-auto-rows: auto;
        height: 100%;
        list-style-type: none;
        margin: 0;
        padding: 0;

        .slot {
          border: 1px solid #fff;
          background: #eee;
          position: relative;
          align-items: center;
          justify-content: center;
          align-content: center;
          font-family: sans-serif;
          font-size: 0.8rem;

          &.selected {
            background-color: yellow;
          }

          &.free {
            border: 1px solid green;
          }
          &.partial {
            border: 1px solid #ccc;
          }
          &.busy {
            border: 1px solid red;
            cursor: not-allowed;
            opacity: 0.3;
          }
        }
      }
    }
    button.confirm {
      grid-column: -1 / 1;
    }
  }
</style>

<nylas-error {id} />
<main bind:this={main} bind:clientHeight class:ticked={show_ticks}>
  {#if show_ticks}
    <ul class="ticks">
      {#each ticks as tick}
        <li class="tick">{tick.toLocaleTimeString()}</li>
      {/each}
    </ul>
  {/if}
  <div class="days">
    {#each days as day}
      <div class="day">
        <header>
          <h2>{new Date(day.timestamp).toLocaleDateString()}</h2>
        </header>
        <div class="slots">
          {#each day.slots as slot}
            <button
              data-available-calendars={slot.available_calendars.toString()}
              aria-label="{new Date(
                slot.start_time,
              ).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}}"
              class="slot {slot.selectionStatus} {slot.availability}"
              data-start-time={new Date(slot.start_time).toLocaleString()}
              data-end-time={new Date(slot.end_time).toLocaleString()}
              disabled={slot.availability === AvailabilityStatus.BUSY}
              on:click={() => {
                slot.selectionStatus =
                  slot.selectionStatus === SelectionStatus.SELECTED
                    ? SelectionStatus.UNSELECTED
                    : SelectionStatus.SELECTED;
                toggleSelectedTimeSlots(slot);
                if (!allow_booking) {
                  dispatchEvent("timeSlotChosen", { timeSlots: slot });
                }
              }}
            />
          {/each}
        </div>
      </div>
    {/each}
  </div>
  {#if slotSelection.length && allow_booking}
    <button
      class="confirm"
      type="button"
      on:click={() => sortAndSetEvent(sortedSlots)}
      >{`Confirm Time slot${slotSelection.length > 1 ? "s" : ""}`}</button
    >
  {/if}
</main>
