<svelte:options tag="nylas-availability" />

<script lang="ts">
  import { store } from "../../../commons/src";
  import { onMount, tick } from "svelte";
  import { get_current_component } from "svelte/internal";
  import { getEventDispatcher } from "@commons/methods/component";
  import * as d3 from "d3";

  const { ManifestStore } = store;

  //#region props
  export let id: string = "";
  export let access_token: string = "";
  export let start_hour: number | string = 0;
  export let end_hour: number | string = 24;
  export let slot_size: number | string = 15; // in minutes
  export let start_date: Date = new Date();
  export let dates_to_show: number = 1;
  export let click_action: "choose" | "verify" = "choose";
  export let available_times: Availability.TimeSlot[] = [];

  //#endregion props

  //#region mount
  let manifest: Partial<Availability.Manifest> = {};
  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};
  });
  //#endregion mount

  const dispatchEvent = getEventDispatcher(get_current_component());

  //#region layout
  let main: Element;
  let slotSelection: Availability.TimeSlot[] = [];

  // You can have as few as 1, and as many as 7, days shown
  $: startDay = d3.timeDay(new Date().setDate(start_date.getDate()));
  $: endDay = d3.timeDay(
    new Date().setDate(start_date.getDate() + dates_to_show - 1),
  );

  // map over the ticks() of the time scale between your start day and end day
  // populate them with as many slots as your start_hour, end_hour, and slot_size dictate

  $: generateDaySlots = function (timestamp, start_hour, end_hour) {
    const dayStart = d3.timeHour(new Date(timestamp).setHours(start_hour));
    const dayEnd = d3.timeHour(new Date(timestamp).setHours(end_hour));
    return d3
      .scaleTime()
      .domain([dayStart, dayEnd])
      .ticks(d3.timeMinute.every(slot_size))
      .map((time) => {
        const endTime = d3.timeMinute.offset(time, slot_size);

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

  $: days = d3
    .scaleTime()
    .domain([startDay, endDay])
    .ticks(d3.timeDay)
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
  main {
    height: 100vh;
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;
    .days {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: auto;
    }

    .day {
      display: grid;
      grid-template-rows: auto 1fr;

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
    }
  }
</style>

<nylas-error {id} />
<main bind:this={main}>
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
