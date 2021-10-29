<svelte:options tag="pagination-nav" />

<script lang="ts">
  export let current_page: number = 1;
  export let last_page: number = 1;

  import { getEventDispatcher } from "@commons/methods/component";
  import { get_current_component } from "svelte/internal";

  import FirstIcon from "../assets/double-left-arrow.svg";
  import BackIcon from "../assets/left-arrow.svg";
  import NextIcon from "../assets/right-arrow.svg";
  import LastIcon from "../assets/double-right-arrow.svg";

  const dispatchEvent = getEventDispatcher(get_current_component());

  function changePage(newPage: number) {
    dispatchEvent("changePage", {
      newPage: newPage,
    });
  }
</script>

<style lang="scss">
  .pagination-nav {
    --disabled-text: ##454954;
    --font: -apple-system, BlinkMacSystemFont, sans-serif;
    display: flex;
    align-items: center;
  }

  button {
    text-align: center;
    min-width: 38px;
    min-height: 38px;
    margin-top: 25px;
    border: #e3e8ee solid 1px;
    margin-right: -1px;
    font-family: var(--font);
    background-color: #f7f7f8;
    color: #454954;
    cursor: pointer;

    /*&:disabled {
      background-color: var(--disabled);
      color: var(--disabled-text);
    }*/

    &.current {
      background-color: white;
      color: #2c2e2e;
    }
  }

  .page-numbers {
    margin: 0 8px;
  }
</style>

<nav class="pagination-nav">
  {#if last_page > 1}
    <button
      class="paginate-btn first-btn"
      on:click={() => changePage(1)}
      disabled={current_page === 1}
    >
      <FirstIcon style="width: 24px; height: 24px;" />
    </button>
    <button
      class="paginate-btn back-btn"
      on:click={() => changePage(current_page - 1)}
      disabled={current_page === 1}
    >
      <BackIcon style="width: 24px; height: 24px;" />
    </button>
  {/if}
  <div class="page-numbers">
    {#each { length: last_page } as _, i}
      <button
        class="paginate-btn {current_page === i + 1 ? 'current' : ''}"
        on:click={() => changePage(i + 1)}
        disabled={current_page === i + 1}>{i + 1}</button
      >
    {/each}
  </div>
  {#if last_page > 1}
    <button
      class="paginate-btn next-btn"
      on:click={() => changePage(current_page + 1)}
      disabled={current_page === last_page}
    >
      <NextIcon style="height:24px;width:24px;" />
    </button>
    <button
      class="paginate-btn last-btn"
      on:click={() => changePage(last_page)}
      disabled={current_page === last_page}
    >
      <LastIcon style="height:24px;width:24px;" />
    </button>
  {/if}
</nav>
