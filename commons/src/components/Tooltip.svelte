<svelte:options tag="nylas-tooltip" />

<script lang="ts">
  import { get_current_component } from "svelte/internal";
  import { getEventDispatcher } from "@commons/methods/component";
  const dispatchEvent = getEventDispatcher(get_current_component());

  /**
   * Add this CSS to the parent component: nylas-tooltip { position: relative; }
   * This ensures the tooltip is positioned absolutely to the tooltip component rather than the page
   **/

  // #region tooltip props
  export let current_tooltip_id; // id of visible tooltip in parent component
  export let content;
  export let id;
  export let icon;
  export let text;
  // #endregion tooltip props

  $: isTooltipVisible =
    current_tooltip_id && current_tooltip_id === id ? true : false;

  // send tooltipID to parent component, so it updates the current_tooltip_id prop
  function toggleTooltipVisibility() {
    if (current_tooltip_id !== id) {
      dispatchEvent("toggleTooltip", {
        tooltipID: id,
      });
    } else {
      // close the tooltip if user clicks tooltip button again
      isTooltipVisible = !isTooltipVisible;
    }
  }
</script>

<style lang="scss">
  @import "../../../components/theming/variables.scss";
  $spacing-s: 0.5rem;
  button.tooltip-trigger {
    background: transparent;
    border: none;
    box-shadow: none;
    cursor: pointer;
    padding: 0;
    height: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
    justify-content: center;
  }

  .icon-container {
    width: 1rem;
    &.reverse-icon {
      transform: rotate(180deg);
    }
  }

  p.tooltip {
    background: var(--grey-lightest);
    border-radius: 2px;
    color: var(--grey-dark);
    box-shadow: 0px 3px 2px rgba(0, 0, 0, 0.25);
    left: 50%;
    padding: $spacing-s;
    position: absolute;
    top: 8px;
    transform: translate(-50%, 0);
    width: max-content;
    z-index: 1;
  }
</style>

<button
  class="tooltip-trigger"
  aria-expanded={isTooltipVisible ? "true" : "false"}
  id={id ? `tooltip-trigger-${id}` : ""}
  aria-describedby={id}
  aria-label={isTooltipVisible ? "hide email" : "show email"}
  on:click|stopPropagation={(e) => toggleTooltipVisibility(e)}
>
  {#if text}
    <p>{@html text}</p>
  {/if}
  {#if icon}
    <div class="icon-container" class:reverse-icon={icon && isTooltipVisible}>
      <svelte:component this={icon} aria-hidden="true" />
    </div>
  {/if}
</button>
{#if isTooltipVisible}
  <p {id} role="tooltip" tabindex="0" class="tooltip">
    {@html content}
  </p>
{/if}
