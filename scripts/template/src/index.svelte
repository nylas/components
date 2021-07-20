<svelte:options tag="nylas-$NAME$" />

<script lang="ts">
  import { store } from "../../../commons/src";
  import { onMount, tick } from "svelte";

  const { ManifestStore } = store;
  export let id: string = "";
  export let access_token: string = "";

  let manifest;
  onMount(async () => {
    await tick();
    const storeKey = JSON.stringify({ component_id: id, access_token });
    manifest = (await $ManifestStore[storeKey]) || {};
  });
</script>

<style lang="scss">
</style>

{#if manifest && manifest.error}
  <nylas-domain-error {id} />
{:else}
  $NAME$ Component!
{/if}
