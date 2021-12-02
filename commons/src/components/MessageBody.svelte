<svelte:options tag="nylas-message-body" />

<!-- This component is being used to render Message body in Email component. 
  This is to ensure the styles in the html message body are encapsulated and 
  does not affect the global component enclosing it -->
<script>
  import * as DOMPurify from "dompurify";
  import { getEventDispatcher } from "@commons/methods/component";
  import { get_current_component, onMount } from "svelte/internal";

  export let message;

  const dispatchEvent = getEventDispatcher(get_current_component());

  async function downloadSelectedFile(event, file) {
    event.stopImmediatePropagation();
    dispatchEvent("downloadClicked", {
      event,
      message,
      file,
    });
  }

  let attachedFiles = [];

  onMount(() => {
    if (message && message.files.length > 0) {
      for (const [fileIndex, file] of message.files.entries()) {
        if (file.content_disposition === "attachment") {
          attachedFiles.push(message.files[fileIndex]);
        }
      }
    }
  });
</script>

<style lang="scss">
  div {
    width: inherit;

    div.attachment {
      margin: 1rem 0 0 0;
      display: flex;
      gap: 0.5rem;

      button {
        padding: 0.3rem 1rem;
        border: 1px solid var(--grey);
        border-radius: 30px;
        background: white;
        cursor: pointer;
        &:hover {
          background: var(--grey-light);
        }
      }
    }
  }
</style>

<div>
  {#if message && message.body}
    {@html DOMPurify.sanitize(message.body)}
    <div class="attachment">
      {#await attachedFiles then files}
        {#if files && Array.isArray(files) && files.length > 0}
          {#each files as file}
            <button
              on:click|stopPropagation={(e) => downloadSelectedFile(e, file)}
            >
              {file.filename || file.id}
            </button>
          {/each}
        {/if}
      {/await}
    </div>
  {/if}
</div>
