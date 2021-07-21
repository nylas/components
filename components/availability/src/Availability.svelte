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
  let timeslot: {
    start_time: string;
    end_time: string;
  };
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
  let slotSelection: any[] = [];

  // You can have as few as 1, and as many as 7, days shown
  $: startDay = d3.timeDay(new Date().setDate(start_date.getDate()));
  $: endDay = d3.timeDay(
    new Date().setDate(start_date.getDate() + dates_to_show - 1),
  );

  // map over the ticks() of the time scale between your start day and end day
  // populate them with as many slots as your start_hour, end_hour, and slot_size dictate
  $: days = d3
    .scaleTime()
    .domain([startDay, endDay])
    .ticks(d3.timeDay)
    .map((timestamp) => {
      let dayStart = d3.timeHour(new Date(timestamp).setHours(start_hour));
      let dayEnd = d3.timeHour(new Date(timestamp).setHours(end_hour));
      let slots = d3
        .scaleTime()
        .domain([dayStart, dayEnd])
        .ticks(d3.timeMinute.every(slot_size))
        .map((time) => {
          return {
            status: "unselected",
            time,
          };
        });
      return {
        slots,
        timestamp,
      };
    });
  //#endregion layout

  function getEndTime(start_time: Date): Date {
    let end_time = new Date(start_time.valueOf());
    end_time.setMinutes(end_time.getMinutes() + slot_size);
    return end_time;
  }

  function handleTimeSlotClick(selectedSlot: any): string {
    if (selectedSlot.status === "unselected") {
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

  function sendTimeSlot(selectedSlot: any) {
    let start_time = new Date(selectedSlot.time);
    let end_time = getEndTime(start_time);
    timeslot = {
      start_time: start_time.toLocaleTimeString(),
      end_time: end_time.toLocaleTimeString(),
    };
    dispatchEvent("timeSlotChosen", {
      timeslot: timeslot,
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
      // height: 100vh;
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
          // display: flex;
          // flex-direction: column;
          position: relative;
          align-items: center;
          justify-content: center;
          align-content: center;

          &.selected {
            background-color: yellow;
          }
          span {
            position: absolute;
            width: 100%;
            height: 100%;
            display: grid;
            justify-content: center;
            align-content: center;
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
        <ul class="slots">
          {#each day.slots as slot}
            <li
              class="slot {slot.status}"
              on:click={() => {
                slot.status = handleTimeSlotClick(slot);
              }}
              on:mouseover={() =>
                console.log(new Date(slot.time).toLocaleTimeString())}
            >
              <span>{new Date(slot.time).toLocaleString()}</span>
            </li>
          {/each}
        </ul>
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
            selectedSlot.status = "unselected";
            slotSelection = [];
          });
        }}
        class="confirm-btn">Yes</button
      >
    </footer>
  {/if}
</main>
