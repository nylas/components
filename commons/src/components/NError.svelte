<svelte:options tag="nylas-error" immutable={true} />

<script lang="ts">
  import { NErrorExplanationMap } from "./NErrorMapping";
  import { ErrorStore } from "../index";

  export let id; // component id

  $: error = $ErrorStore[id] || { name: "" };
  $: explanation = NErrorExplanationMap[error.name]();
</script>

<style>
  .message-container {
    padding: 0.5rem;
    font-size: 11px;
    color: red;
    text-align: initial;
  }

  .message-container *:focus {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .details {
    font-size: 8px;
    color: #494949;
  }
</style>

{#if error.name}
  <div class="message-container">
    <h3>
      {@html explanation.title}
    </h3>
    <h4>
      {@html explanation.subtitle}
    </h4>
    <span class="details">Debug info:</span>
    <textarea class="details" readonly cols={64}>
      {error.name}: {id}
    </textarea>
  </div>
{/if}
