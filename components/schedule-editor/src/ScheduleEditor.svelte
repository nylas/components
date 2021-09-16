<svelte:options tag="nylas-schedule-editor" />

<script lang="ts">
  import { ManifestStore } from "../../../commons/src";
  import { onMount, tick } from "svelte";

  import type { Manifest } from "@commons/types/ScheduleEditor";
  import {
    getPropertyValue,
    buildInternalProps,
  } from "@commons/methods/component";

  export let id: string = "";
  export let access_token: string = "";
  export let event_title: string;
  export let event_description: string;
  export let show_hosts: "show" | "hide";

  //#region mount and prop initialization
  let internalProps: Partial<Manifest> = {};
  let manifest: Partial<Manifest> = {};
  onMount(async () => {
    await tick();
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
    event_title = getPropertyValue(
      internalProps.event_title,
      event_title,
      "Meeting",
    );
    event_description = getPropertyValue(
      internalProps.event_description,
      event_description,
      "",
    );
    show_hosts = getPropertyValue(internalProps.show_hosts, show_hosts, "show");
  }

  $: manifestProperties = {
    event_title,
    event_description,
    show_hosts,
  };
  // #endregion mount and prop initialization

  function saveProperties() {
    console.log("Saving the following properties:");
    Object.entries(manifestProperties).forEach(([k, v]) => {
      console.log(k, v);
    });
  }
</script>

<style lang="scss">
</style>

{#if manifest && manifest.error}
  <nylas-domain-error {id} />
{:else}
  <div>
    <label>
      <strong>Event Title</strong>
      <input type="text" bind:value={manifestProperties.event_title} />
    </label>
  </div>
  <div>
    <label>
      <strong>Event Description</strong>
      <input type="text" bind:value={manifestProperties.event_description} />
    </label>
  </div>
  <div>
    <strong>Show meeting hosts to the end-user?</strong>
    <label>
      <input
        type="radio"
        name="show_hosts"
        bind:group={manifestProperties.show_hosts}
        value="show"
      />
      <span>Show Hosts</span>
    </label>
    <label>
      <input
        type="radio"
        name="show_hosts"
        bind:group={manifestProperties.show_hosts}
        value="hide"
      />
      <span>Hide Hosts</span>
    </label>
  </div>

  <button on:click={saveProperties}>Save Editor Options</button>
{/if}
