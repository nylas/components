<svelte:options tag="nylas-tooltip" />

<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import { getEventDispatcher } from "@commons/methods/component";
  const dispatchEvent = getEventDispatcher(get_current_component());

  // #region tooltip props
  export let current_tooltip_id; // tooltip of currently open tooltip; this toggles other tooltips
  export let content;
  export let id;
  export let icon;
  // #endregion tooltip props

  $: isTooltipVisible =
    current_tooltip_id && current_tooltip_id === id ? true : false;

  // send tooltipID to parent component, so it updates the current_tooltip_id prop
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
    background: transparent;
    border: none;
    box-shadow: none;
    height: 24px;
    width: 24px;
  }

  button.tooltip-trigger :global(svg) {
    width: 24px;
  }

  p.tooltip {
    position: absolute;
    width: min-content;
    z-index: 1;
    bottom: 0;
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
  id={`button-${id?.slice(0, 3)}`}
  aria-describedby={id}
  aria-label={isTooltipVisible ? "hide email" : "show email"}
  on:click|stopPropagation={(e) => dispatchTooltip(e)}
>
  {#if icon}
    <svelte:component this={icon} class="icon-container" aria-hidden="true" />
  {/if}
</button>
{#if isTooltipVisible}
  <p {id} role="tooltip" tabindex="0" class="tooltip">
    {content}
  </p>
{/if}
