<svelte:options tag="nylas-error" immutable={true} />

<script lang="ts">
  import { NErrorExplanationMap } from "./NErrorMapping";
  import { ErrorStore } from "../index";

  export let id; // component id

  $: error = $ErrorStore[id] || { name: "" };
  $: explanation = NErrorExplanationMap[errorName]();
  $: errorName = !error.name ? error.message?.name : error.name;
  const isDevEnv = window.location.href.includes("localhost");
</script>

<style>
  .message-container {
    background: #fff6f6;
    border-radius: 5px;
    box-shadow: 0 0 0 1px #aa92a0 inset, 0 0 0 0 transparent;
    color: #9f3a38;
    font-size: 1.25rem;
    padding: 10px;
    margin: 0 auto;
    transition: opacity 500ms ease, color 500ms ease,
      background-color 500ms ease, box-shadow 500ms ease,
      -webkit-box-shadow 500ms ease;
  }

  .message-container *:focus {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .details {
    color: #494949;
    font-size: 0.75rem;
    width: 100%;
  }
</style>

{#if errorName && isDevEnv}
  <div class="message-container">
    {#if explanation.title}
      <h3>
        {@html explanation.title}
      </h3>
    {/if}
    {#if explanation.subtitle}
      <h4>
        {@html explanation.subtitle}
      </h4>
    {/if}
    <span class="details">Debug info:</span>
    <textarea class="details" readonly>
      {errorName}: {id}
      {error.message.message ? error.message.message : ""}
    </textarea>
  </div>
{/if}
