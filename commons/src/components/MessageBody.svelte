<svelte:options tag="nylas-message-body" />

<!-- This component is being used to render Message body in Email component. 
  This is to ensure the styles in the html message body are encapsulated and 
  does not affect the global component enclosing it -->
<script>
  export let message;
</script>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>

<div>
  {#if message && message.body}
    {@html message.body}
  {/if}
</div>
