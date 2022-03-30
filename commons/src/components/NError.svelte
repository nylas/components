<svelte:options tag="nylas-error" immutable={true} />

<script lang="ts">
  import { ErrorStore } from "../store/error";
  import type { NError } from "@commons/types/Nylas";

  export let id: string; // component id

  let error: NError;
  let errorName: string;

  $: {
    error = $ErrorStore[id] ?? { name: "" };
    errorName = error.name ?? error.message?.name ?? "";
  }

  const isDevEnv =
    window.location.href.includes("localhost") ||
    window.location.href.includes("127.0.0.1");
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
    {#if errorName === "HostDomainNotAllowedError"}
      <h3>
        You are trying to access this component from&nbsp;
        <code>{window.location.hostname}</code>. The component's settings do not
        allow access from this domain.
      </h3>
      <h4>
        The list of allowed domains can be modified in your&nbsp;
        <a href="https://dashboard.nylas.com">Dashboard</a>.
      </h4>
    {:else if errorName === "IncompatibleProperties"}
      <h3>Your component properties do not work with each other.</h3>
    {:else if errorName === "MissingDataProperties"}
      <div>
        <h3>
          {error.message ?? ""}
          {#if error.link}
            <a href={error.link} target="_blank">{error.linkName}</a>
          {/if}
        </h3>
      </div>
    {/if}
    <span class="details">Debug info:</span>
    <textarea class="details" readonly>
      {errorName}: {id}
      {error.message?.message ?? ""}
    </textarea>
  </div>
{/if}
