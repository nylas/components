<svelte:options tag="nylas-message-error" />

<script>
  export let error_message = "Uh oh! Looks like an error occurred";
</script>

<style lang="scss">
  @import "../../../components/theming/reset.scss";
  @import "../../../components/theming/variables.scss";

  div {
    background: var(--red-lighter);
    bottom: 0;
    color: var(--red);
    font-size: 1rem;
    line-height: 24px;
    min-height: 85px;
    padding: 20px 24px;
    position: fixed;
    right: 0;
    min-width: 240px;
    z-index: 2;
  }

  button {
    background: transparent;
    color: var(--blue);
    cursor: pointer;
    font-style: italic;
    text-decoration: underline;
    margin-top: 10px;
  }
</style>

<div>
  <p>{error_message}</p>
  <button type="button" on:click={() => location.reload()}>
    Refresh your page
  </button>
</div>
