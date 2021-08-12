<svelte:options tag="nylas-tooltip" />

<script>
  import { get_current_component } from "svelte/internal";
  import { getEventDispatcher } from "@commons/methods/component";
  const dispatchEvent = getEventDispatcher(get_current_component());

  // #region tooltip props
  export let currentTooltipID; // tooltip of currently open tooltip; this closes other tooltips
  $: currentTooltipID; // tooltip of currently open tooltip; this closes other tooltips
  export let message;
  $: message;
  export let id;
  $: id;
  export let icon;
  // #endregion tooltip props

  $: isTooltipVisible =
    currentTooltipID && currentTooltipID === id ? true : false;

  function dispatchTooltip() {
    dispatchEvent("toggleTooltip", {
      tooltipID: id,
    });
  }
</script>

<style lang="scss">
  @import "../../../components/theming/variables.scss";
  $spacing-s: 0.5rem;

  button.tooltip-trigger {
    position: relative;
    display: inline-block;
    background: transparent;
    height: 24px;
    width: 24px;
    padding: 12px;
  }
  p.tooltip {
    position: absolute;
    width: min-content;
    z-index: 1;
    top: 125%;
    background: var(--grey-lightest);
    color: var(--grey-dark);
    padding: $spacing-s;
    box-shadow: 0px 3px 2px rgba(0, 0, 0, 0.25);
    border-radius: 2px;
  }
</style>

<button
  class="tooltip-trigger"
  aria-expanded={isTooltipVisible ? "true" : "false"}
  id={`button-${message?.id.slice(0, 3)}`}
  aria-describedby={id}
  aria-label={isTooltipVisible ? "hide email" : "show email"}
  on:click={dispatchTooltip}
>
  {#if icon}
    <svelte:component this={icon} class="icon-container" aria-hidden="true" />
  {/if}
</button>
{#if isTooltipVisible}
  <p {id} role="tooltip" tabindex="0" class="tooltip">
    {message?.from[0].email}
  </p>
{/if}
