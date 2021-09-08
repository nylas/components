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
  }

  $: editableProperties = [
    {
      label: "Event Title",
      value: event_title,
    },
    {
      label: "Event Description",
      value: event_description,
    },
  ];
  // #endregion mount and prop initialization

  function saveProperties() {
    console.log("Saving the following properties:");
    console.log(editableProperties);
  }
</script>

<style lang="scss">
</style>

{#if manifest && manifest.error}
  <nylas-domain-error {id} />
{:else}
  {#each editableProperties as prop}
    <label>
      <strong>{prop.label}</strong>
      <input value={prop.value} />
    </label>
  {/each}
  <button on:click={saveProperties}>Save Editor Options</button>
{/if}
