<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import { ManifestStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";
  import "../../availability/src/Availability.svelte";

  export let id: string = "";
  export let access_token: string = "";

  import type { Manifest } from "@commons/types/Scheduler";

  let manifest: Partial<Manifest> = {};
  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};
  });

  function timeSlotChosen({ detail }) {
    console.log("timeslots chosen", detail.timeSlots);
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
  <nylas-availability on:timeSlotChosen={timeSlotChosen} />
  <section class="booker">
    <h2>Event-bookable details to follow here</h2>
  </section>
</main>
