<svelte:options tag="pagination-nav" />

<script lang="ts">
  export let current_page: number = 0;
  export let items_per_page: number;
  export let num_pages: number = 1;
  export let num_items: number;
  export let num_pages_visible: boolean = true;

  import { getEventDispatcher } from "@commons/methods/component";
  import { get_current_component } from "svelte/internal";

  import FirstIcon from "../assets/double-left-arrow.svg";
  import BackIcon from "../assets/left-arrow.svg";
  import NextIcon from "../assets/right-arrow.svg";
  import LastIcon from "../assets/double-right-arrow.svg";

  const dispatchEvent = getEventDispatcher(get_current_component());

  function changePage(newPage: number) {
    dispatchEvent("changePage", {
      newPage,
    });
  }
</script>

<style lang="scss">
  .pagination-nav {
    --disabled-text: #454954;
    --font: -apple-system, BlinkMacSystemFont, sans-serif;
    display: flex;
    align-items: center;

    .page-indicator {
      color: var(--nylas-mailbox-pagination-indicator-color, #454954);
      height: 38px;
      margin: 2em 1em 0 1em;
    }
    .paginate-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 1em;
      text-align: center;
      min-width: 38px;
      min-height: 38px;
      margin-right: -1px;
      font-family: var(--font);
      cursor: pointer;
      border: 1px solid
        var(--nylas-mailbox-pagination-button-border-color, #e3e8ee);
      background-color: var(
        --nylas-mailbox-pagination-button-background,
        #f7f7f8
      );
      color: var(--nylas-mailbox-pagination-button-color, #454954);

      * {
        stroke: var(--nylas-mailbox-pagination-button-color, #454954);
      }

      &:hover {
        background-color: var(
          --nylas-mailbox-pagination-button-hover-color,
          #eaeaea
        );
      }

      &.current {
        background-color: white;
        color: #2c2e2e;
      }
      &:disabled {
        cursor: default;
        background-color: var(
          --nylas-mailbox-pagination-button-background-disabled,
          #f7f7f8
        );
        border: 1px solid
          var(--nylas-mailbox-pagination-button-background-disabled, #f7f7f8);
      }
    }
  }

  .page-numbers {
    margin: 0 8px;
  }
</style>

<nav class="pagination-nav">
  {#if num_pages_visible}
    <span class="page-indicator">
      <span class="page-start">
        {current_page * items_per_page + 1}
      </span>
      -
      <span class="page-end">
        {Math.min((current_page + 1) * items_per_page, num_items)}
      </span>
      of
      <span class="total">{num_items}</span>
    </span>
  {/if}
  {#if num_pages > 1}
    <button
      class="paginate-btn first-btn"
      on:click={() => changePage(0)}
      disabled={current_page === 0}>
      <FirstIcon style="width: 24px; height: 24px;" />
    </button>
    <button
      class="paginate-btn back-btn"
      on:click={() => changePage(current_page - 1)}
      disabled={current_page === 0}>
      <BackIcon style="width: 24px; height: 24px;" />
    </button>
    <button
      class="paginate-btn next-btn"
      on:click={() => changePage(current_page + 1)}
      disabled={current_page === num_pages - 1}>
      <NextIcon style="height:24px;width:24px;" />
    </button>
    <button
      class="paginate-btn last-btn"
      on:click={() => changePage(num_pages - 1)}
      disabled={current_page === num_pages - 1}>
      <LastIcon style="height:24px;width:24px;" />
    </button>
  {/if}
</nav>
