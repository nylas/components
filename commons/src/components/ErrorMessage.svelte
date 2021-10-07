<svelte:options tag="nylas-message-error" />

<style lang="scss">
  @import "../../../components/theming/reset.scss";
  @import "../../../components/theming/variables.scss";

  div {
    background: var(--red-lighter);
    bottom: 0;
    color: var(--red);
    font-size: 1rem;
    line-height: 24px;
    height: 85px;
    padding: 20px 24px;
    position: absolute;
    right: 0;
    width: 240px;
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
  <p>Uh oh! Looks like an error occurred</p>
  <button type="button" on:click={() => location.reload()}
    >Refresh your page</button
  >
</div>
