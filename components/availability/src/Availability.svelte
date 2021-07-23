<svelte:options tag="nylas-availability" />

<script lang="ts">
  import { ManifestStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";
  import { get_current_component } from "svelte/internal";
  import { getEventDispatcher } from "@commons/methods/component";
  import type { TimeInterval } from "d3-time";
  import { timeDay, timeHour, timeMinute } from "d3-time";
  import { scaleTime } from "d3-scale";

  //#region props
  export let id: string = "";
  export let access_token: string = "";
  export let start_hour: number = 0;
  export let end_hour: number = 24;
  export let slot_size: number = 15; // in minutes
  export let start_date: Date = new Date();
  export let dates_to_show: number = 1;
  export let click_action: "choose" | "verify" = "choose";
  export let available_times: Availability.TimeSlot[] = [];
  export let show_ticks: boolean = true;

  //#endregion props

  //#region mount
  let manifest: Partial<Availability.Manifest> = {};
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

  let slotSelection: Availability.SelectableSlot[] = [];

  // You can have as few as 1, and as many as 7, days shown
  $: startDay = timeDay(new Date(new Date().setDate(start_date.getDate())));
  $: endDay = timeDay(
    new Date(new Date().setDate(start_date.getDate() + dates_to_show - 1)),
  );

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

        let slotIsAvailable = true; // default
        if (available_times.length) {
          slotIsAvailable = available_times.some((slot) => {
            return time > slot.start_time && endTime < slot.end_time;
          });
        }

        return {
          selectionStatus: "unselected",
          availability: slotIsAvailable ? "available" : "unavailable",
          start_time: time,
          end_time: endTime,
        };
      });
  };

  let ticks = [];

  // We don't want to show all 96 15-minute intervals unless the user has a real tall screen.
  // So let's be smart about it and filter on mod.
  const generateTicks = (skipIntervals: number = 1) => {
    console.log("generating ticks when", ticks.length, skipIntervals);
    ticks = ticks.filter((time, iter) => !(iter % skipIntervals));
    let averageTickHeight = clientHeight / ticks.length;
    if (averageTickHeight < 40 && skipIntervals < 4) {
      console.log(
        "You done goofed on",
        skipIntervals,
        "because averageTickHeight is",
        averageTickHeight,
        "and now ticks are",
        ticks.length,
      );
      // debugger;
      generateTicks(skipIntervals + 1);
    }
  };

  // $: if (averageTickHeight && days[0].slots.length) generateTicks();
  $: {
    console.log("first looper");
    if (days[0].slots.length && clientHeight) {
      ticks = days[0].slots.map((s) => s.start_time);
      generateTicks();
    }
  }
  // let numberOfTicksToShow:number = 24;
  // $: {
  //   if (slot_size === 60) {
  //     numberOfTicksToShow = 24;
  //   }
  //   numberOfTicksToShow = clientHeight / days[0].slots.length;
  // }
  // $: {
  //   const dayStart = timeHour(
  //     new Date(new Date(start_date).setHours(start_hour)),
  //   );
  //   const dayEnd = timeHour(new Date(new Date(start_date).setHours(end_hour-1)));
  //   let numberOfTicksToShow = (end_hour - start_hour) / (slot_size / 60) + 1;
  //   console.log({numberOfTicksToShow});
  //   ticks = scaleTime().domain([dayStart, dayEnd]).ticks(numberOfTicksToShow);
  // }

  // $: console.log({slots_shown: days[0].slots.length}, {ticks}, {clientHeight})

  $: days = scaleTime()
    .domain([startDay, endDay])
    .ticks(timeDay)
    .map((timestamp) => {
      let slots = generateDaySlots(timestamp, start_hour, end_hour);
      return {
        slots,
        timestamp,
      };
    });
  //#endregion layout

  function handleTimeSlotClick(selectedSlot: any): string {
    if (selectedSlot.selectionStatus === "unselected") {
      if (click_action === "choose") {
        sendTimeSlot(selectedSlot);
      }
      slotSelection = [...slotSelection, selectedSlot];
      return "selected";
    } else {
      slotSelection = slotSelection.filter(
        (chosenSlot) => chosenSlot != selectedSlot,
      );

      return "unselected";
    }
  }

  function sendTimeSlot(selectedSlot: Availability.TimeSlot) {
    let start_time = new Date(selectedSlot.start_time);
    let end_time = new Date(selectedSlot.end_time);
    const timeslot: Availability.TimeSlot = {
      start_time,
      end_time,
    };
    dispatchEvent("timeSlotChosen", {
      timeslot,
    });
  }
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

          &.available {
            border: 1px solid green;
          }
          &.unavailable {
            border: 1px solid red;
            opacity: 0.3;
          }
        }
      }
    }

    footer.confirmation {
      text-align: center;
      padding: 1rem;
      grid-column: -1 / 1;
    }
  }
</style>

<nylas-error {id} />
{console.log("TICKS HERE", ticks.length)}
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
              aria-label="{new Date(
                slot.start_time,
              ).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}}"
              class="slot {slot.selectionStatus} {slot.availability}"
              data-start-time={new Date(slot.start_time).toLocaleString()}
              data-end-time={new Date(slot.end_time).toLocaleString()}
              on:mouseover={() =>
                console.log(
                  "TODO: temp; ",
                  new Date(slot.start_time).toLocaleString(),
                )}
              on:click={() => {
                slot.selectionStatus = handleTimeSlotClick(slot);
              }}
            />
          {/each}
        </div>
      </div>
    {/each}
  </div>
  {#if click_action === "verify"}
    <footer class="confirmation">
      Confirm time?
      <button
        disabled={!slotSelection.length}
        on:click={() => {
          slotSelection.forEach((selectedSlot) => {
            sendTimeSlot(selectedSlot);
            selectedSlot.selectionStatus = "unselected";
            slotSelection = [];
          });
        }}
        class="confirm-btn">Yes</button
      >
    </footer>
  {/if}
</main>
