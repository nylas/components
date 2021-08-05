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
    SelectionStatus,
    AvailabilityStatus,
  } from "@commons/types/Availability";

  import type {
    Calendar,
    Manifest,
    TimeSlot,
    SelectableSlot,
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
  export let max_bookable_slots: number = 1;
  export let partial_bookable_ratio: number = 0;
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

  let slotSelection: SelectableSlot[] = [];

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

        if (
          availability === AvailabilityStatus.PARTIAL &&
          freeCalendars.length < allCalendars.length * partial_bookable_ratio
        ) {
          availability = AvailabilityStatus.BUSY;
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

  // Consecutive same-availability periods of time, from earliest start_time to latest end_time.
  function generateEpochs(
    slots: SelectableSlot[],
    partial_bookable_ratio: number,
  ) {
    const epochScale = scaleTime().domain([
      slots[0].start_time,
      slots[slots.length - 1].end_time,
    ]);
    let epochs = slots
      .reduce((epochList, slot) => {
        const prevEpoch = epochList[epochList.length - 1];
        // Edge case note: available_calendars is doing a stringified array compare, which means if they're differently ordered but otherwise teh same, this will fail.
        if (
          prevEpoch &&
          JSON.stringify(prevEpoch[0].available_calendars) ===
            JSON.stringify(slot.available_calendars)
        ) {
          prevEpoch.push(slot);
        } else {
          epochList.push([slot]);
        }
        return epochList;
      }, [] as TimeSlot[][])
      .map((epoch) => {
        let status = "free";
        const numFreeCalendars = epoch[0].available_calendars.length;
        if (
          numFreeCalendars === 0 ||
          (numFreeCalendars !== allCalendars.length &&
            numFreeCalendars < allCalendars.length * partial_bookable_ratio)
        ) {
          status = "busy";
        } else if (
          numFreeCalendars > 0 &&
          numFreeCalendars !== allCalendars.length
        ) {
          status = "partial";
        }
        return {
          start_time: epoch[0].start_time,
          offset: epochScale(epoch[0].start_time) * 100,
          status,
          height:
            (epochScale(epoch[epoch.length - 1].end_time) -
              epochScale(epoch[0].start_time)) *
            100,
          end_time: epoch[epoch.length - 1].end_time,
          slots: epoch.length,
          available_calendars: epoch[0].available_calendars,
        };
      });
    return epochs;
  }

  $: days = scaleTime()
    .domain([startDay, endDay])
    .ticks(timeDay)
    .map((timestamp) => {
      let slots = generateDaySlots(timestamp, start_hour, end_hour);
      return {
        slots,
        epochs: generateEpochs(slots, partial_bookable_ratio),
        timestamp,
      };
    });
  //#endregion layout

  $: newCalendarTimeslotsForGivenEmails = [];

  $: allCalendars = [
    // TODO: consider merging these 2 into just calendars
    ...calendars,
    ...newCalendarTimeslotsForGivenEmails,
  ];

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
    const consolidatedAvailabilityForGivenDay = await AvailabilityStore.getAvailability(
      availabilityQuery,
    );
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
  let query: EventQuery;
  $: query = {
    component_id: id,
    access_token: access_token,
    calendar_id: "",
    participants: [{ email_address: "" }],
  };
  //#region event query

  //#region booking event logic for single time slot and consecutive time slots
  $: sortedSlots = [
    ...slotSelection.sort((a, b) => (a.start_time > b.start_time ? 1 : 0)),
  ].reduce((events, currentTimeSlot, i) => {
    if (i === 0) {
      events = [currentTimeSlot];
    } else {
      let lastMergedSlot = events[events.length - 1];
      if (currentTimeSlot.start_time <= lastMergedSlot.end_time) {
        lastMergedSlot.end_time = new Date(
          Math.max(
            lastMergedSlot.end_time.getTime(),
            currentTimeSlot.end_time.getTime(),
          ),
        );
      } else {
        events = [...events, currentTimeSlot];
      }
    }
    return events;
  }, [] as TimeSlot[]);

  function toggleSelectedTimeSlots(selectedSlot: SelectableSlot) {
    return (slotSelection =
      selectedSlot.selectionStatus === SelectionStatus.SELECTED
        ? [...slotSelection, selectedSlot]
        : slotSelection.filter((slot) => slot != selectedSlot));
  }

  function sortAndSetEvent(slots: TimeSlot[]) {
    dispatchEvent("timeSlotChosen", { timeSlots: [...slots] });
    if (allow_booking) {
      // EventStore.createEvent(slots, query); // currently doesnt' work as calendar ID is not avaialble (To be completed by a different story)
    }
    slotSelection = [];
  }
  //#region booking event logic for single time slot or consecutive time slots
</script>

<style lang="scss">
  @import "../../theming/variables.scss";
  $headerHeight: 40px;
  $color-free: rgba(54, 210, 173, 0.4);
  $color-busy: rgba(255, 100, 117, 0.4);
  $color-partial: rgba(255, 255, 117, 0.4);
  main {
    height: 100%;
    overflow: hidden;
    display: grid;
    gap: 1rem;
    grid-template-rows: 1fr auto;
    font-family: Arial, Helvetica, sans-serif;
    position: relative;
    z-index: 1;

    &.ticked {
      grid-template-columns: auto 1fr;
    }

    .days {
      display: grid;
      gap: 0.25rem;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
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
      font-size: 0.8rem;
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
      position: relative;

      h2 {
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem;
        height: 30px;
        line-height: 1.875rem;
        font-size: 1rem;
        font-weight: 300;

        .date {
          border-radius: 15px;
          background: var(--blue);
          color: white;
          font-weight: bold;
          display: block;
          width: 30px;
          height: 30px;
          line-height: 1.875rem;
          text-align: center;
        }
      }

      .epochs {
        position: absolute;
        top: $headerHeight;
        width: 100%;
        height: calc(100% - #{$headerHeight});
        background: rgba(255, 255, 255, 0);
        .epoch {
          position: absolute;
          width: 100%;

          .inner {
            margin: 0rem;
            height: calc(100% - 0.5rem);
            overflow: hidden;
            padding: 0.25rem;
          }

          &.busy .inner {
            background-color: $color-busy;
          }
          &.partial .inner {
            background-color: $color-partial;
          }

          &.free .inner {
            background-color: $color-free;
          }

          .available-calendars {
            position: relative;
            z-index: 2;
            span {
              background: rgba(0, 0, 0, 0.5);
              display: inline-block;
              margin: 0.25rem;
              padding: 0.25rem;
              font-size: 0.7rem;
              color: white;

              &.calendar {
                display: none;
              }
            }
          }
          &:hover {
            .available-calendars span.calendar {
              display: inline-block;
            }
          }
        }
      }

      .slots {
        display: grid;
        grid-auto-flow: row;
        grid-auto-rows: auto;
        height: 100%;
        list-style-type: none;
        margin: 0;
        padding: 0;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom: none;

        .slot {
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          background: transparent;
          position: relative;
          align-items: center;
          justify-content: center;
          align-content: center;
          font-family: sans-serif;

          &.selected {
            background-color: purple;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
          }

          &.busy {
            cursor: not-allowed;
          }
        }
      }
    }
    button.confirm {
      grid-column: -1 / 1;
    }

    &.allow_booking {
      .slot:not(.busy):hover,
      .slot:not(.busy):focus {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
        cursor: pointer;
      }
    }
  }
</style>

<nylas-error {id} />
<main
  bind:this={main}
  bind:clientHeight
  class:ticked={show_ticks}
  class:allow_booking
>
  {#if show_ticks}
    <ul class="ticks">
      {#each ticks as tick}
        <li class="tick">
          {tick.toLocaleTimeString("default", {
            hour: "numeric",
            minute: "numeric",
          })}
        </li>
      {/each}
    </ul>
  {/if}
  <div class="days">
    {#each days as day}
      <div class="day">
        <header>
          <h2>
            <span class="date"
              >{new Date(day.timestamp).toLocaleString("default", {
                day: "numeric",
              })}</span
            >
            <span
              >{new Date(day.timestamp).toLocaleString("default", {
                weekday: "long",
              })}</span
            >
          </h2>
        </header>
        <div class="epochs">
          {#each day.epochs as epoch}
            <div
              class="epoch {epoch.status}"
              style="height: {epoch.height}%; top: {epoch.offset}%;"
              aria-label="{new Date(
                epoch.start_time,
              ).toLocaleString()} to {new Date(
                epoch.end_time,
              ).toLocaleString()}; Free calendars: {epoch.available_calendars.toString()}"
              data-available-calendars={epoch.available_calendars.toString()}
              data-start-time={new Date(epoch.start_time).toLocaleString()}
              data-end-time={new Date(epoch.end_time).toLocaleString()}
            >
              <div class="inner">
                <span class="available-calendars">
                  <span
                    >{epoch.available_calendars.length} of {allCalendars.length}</span
                  >
                  {#each epoch.available_calendars as calendar}<span
                      class="calendar">{calendar}</span
                    >{/each}
                </span>
              </div>
            </div>
          {/each}
        </div>
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
                if (allow_booking) {
                  slot.selectionStatus =
                    slot.selectionStatus === SelectionStatus.SELECTED
                      ? SelectionStatus.UNSELECTED
                      : slotSelection.length < max_bookable_slots
                      ? SelectionStatus.SELECTED
                      : SelectionStatus.UNSELECTED;

                  toggleSelectedTimeSlots(slot);
                } else {
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
