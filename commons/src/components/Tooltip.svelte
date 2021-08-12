<svelte:options tag="nylas-tooltip" />

<script>
  export let message;
  $: message;
  export let id;

  let currentTrigger, currentTooltip, previousTrigger, previousTooltip;
  let toggleTooltip = false;
  // function toggleTooltip(e) {
  //   currentTrigger = e.target;
  //   currentTooltip = currentTrigger.querySelector(".tooltip");

  //   if (
  //     currentTooltip &&
  //     currentTrigger.getAttribute("aria-expanded") === "false"
  //   ) {
  //     currentTrigger.setAttribute("aria-expanded", "true");
  //     currentTrigger.setAttribute("aria-label", "hide email");
  //     currentTooltip.style.visibility = "visible";
  //     if (previousTrigger && previousTrigger.id !== currentTrigger.id) {
  //       previousTooltip = previousTrigger.querySelector(".tooltip");
  //       previousTrigger.setAttribute("aria-expanded", "false");
  //       previousTrigger.setAttribute("aria-label", "show email");
  //       previousTooltip.style.visibility = "hidden";
  //     }
  //   } else if (
  //     currentTooltip &&
  //     currentTrigger.getAttribute("aria-expanded") === "true"
  //   ) {
  //     currentTooltip = currentTrigger.querySelector(".tooltip");
  //     currentTrigger.setAttribute("aria-expanded", "false");
  //     currentTrigger.setAttribute("aria-label", "show email");
  //     currentTooltip.style.visibility = "hidden";
  //   }
  //   previousTrigger = currentTrigger;
  // }
</script>

<style lang="scss">
  @import "../../../components/theming/variables.scss";
  $spacing-s: 0.5rem;

  button.tooltip-trigger {
    // position: relative;
    // display: inline-block;
    // background: transparent;
    background: red !important;
    height: 24px;
    width: 24px;
    // width: min-content;
  }
  p.tooltip {
    // position: absolute;
    // visibility: hidden;
    width: min-content;
    z-index: 1;
    top: 125%;
    background: var(--grey-lightest);
    color: var(--grey-dark);
    padding: $spacing-s;
    box-shadow: 0px 3px 2px rgba(0, 0, 0, 0.25);
    border-radius: 2px;
  }

  // &:hover {
  //   p.tooltip {
  //     visibility: visible;
  //   }
  // }
</style>

<button
  class="tooltip-trigger"
  aria-expanded="false"
  id={`button-${message?.id.slice(0, 2)}`}
  aria-describedby={id}
  aria-label="show email"
  on:click|stopPropagation={() => {
    toggleTooltip = !toggleTooltip;
  }}
>
  <slot name="icon" />
</button>
{#if toggleTooltip}
  <p {id} role="tooltip" tabindex="0" class="tooltip">
    {message?.from[0].email}
  </p>
{/if}
