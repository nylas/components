<svelte:options tag="nylas-$NAME$" />

<script lang="ts">
  import { ManifestStore } from "@commons";
  import { onMount, tick } from "svelte";

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
