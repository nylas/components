<svelte:options tag="nylas-scheduler" />

<script lang="ts">
  import { ManifestStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";
  import "../../availability/src/Availability.svelte";

  import {
    getEventDispatcher,
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";

  import type { Manifest } from "@commons/types/Scheduler";

  // #region props
  export let id: string = "";
  export let access_token: string = "";
  export let availability_id: string;
  export let email_ids: string[];
  // #endregion props

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  onMount(async () => {
    await tick();
    // clientHeight = main?.getBoundingClientRect().height;
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};

    internalProps = buildInternalProps($$props, manifest) as Partial<Manifest>;
  });

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
    email_ids = getPropertyValue(internalProps.email_ids, email_ids, []);
  }
  // #endregion mount and prop initialization

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
  <nylas-availability
    show_as_week={true}
    {email_ids}
    id={availability_id}
    on:timeSlotChosen={timeSlotChosen}
  />
  <section class="booker">
    <h2>Event-bookable details to follow here</h2>
  </section>
</main>
